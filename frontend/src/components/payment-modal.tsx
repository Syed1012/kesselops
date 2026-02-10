"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Check, Mail, Download, Receipt, ChevronRight, Apple, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore, selectOrdersTotal } from "@/lib/session-store";
import { createPayment, getSession, type Payment } from "@/lib/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { VISUAL_MENU } from "@/lib/menu-data";
import { SiGooglepay, SiPaypal, SiApple } from "react-icons/si";
import { useRouter } from "next/navigation";

type PaymentMethod = 'CARD' | 'MOBILE_PAY';
type MobileProvider = 'GOOGLE_PAY' | 'APPLE_PAY' | 'PAYPAL';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Removed local Payment interface to use API type

// Card Validation Helpers

// Card Validation Helpers
const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
        return parts.join(" ");
    }
    return value;
};

const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
        return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
};

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
    const { session, orders, setSession, closeSession } = useSessionStore();
    const ordersTotal = useSessionStore(selectOrdersTotal);
    const router = useRouter();

    // States
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [tipPercent, setTipPercent] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewState, setViewState] = useState<'FORM' | 'SUCCESS' | 'FULL_BILL'>('FORM');
    const [error, setError] = useState<string | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);

    // Card Form State
    const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });

    // Receipt Logic
    const [lastPayment, setLastPayment] = useState<{ amount: number; method: string; date: Date, tip: number } | null>(null);
    const [email, setEmail] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Fetch existing payments
    useEffect(() => {
        if (isOpen && session?.id) {
            fetchPayments();
            setViewState('FORM');
            setAmount('');
            setTipPercent('');
            setSelectedMethod(null);
        }
    }, [isOpen, session?.id]);

    const fetchPayments = async () => {
        if (!session?.id) return;
        try {
            const res = await fetch(`/api/sessions/${session.id}/payments`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            } else {
                setPayments([]);
            }
        } catch (err) {
            console.error('Failed to fetch payments:', err);
            setPayments([]);
        }
    };

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = Math.max(0, ordersTotal - totalPaid);

    const calculatedTip = tipPercent && amount ? (parseFloat(amount) * (tipPercent / 100)) : 0;
    const totalCharge = amount ? parseFloat(amount) + calculatedTip : 0;

    const handlePayment = async () => {
        if (!session) return;
        setError(null);

        // Validation
        const payAmount = parseFloat(amount);
        if (isNaN(payAmount) || payAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (payAmount > remainingBalance && remainingBalance > 0) {
            setError(`Amount cannot exceed remaining balance (€${remainingBalance.toFixed(2)})`);
            return;
        }

        // Card Validation
        if (selectedMethod === 'CARD') {
            if (cardDetails.number.replace(/\s/g, '').length < 15 || !cardDetails.expiry || cardDetails.cvc.length < 3 || !cardDetails.name) {
                setError('Please complete all card details');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // Note: In a real app we would charge 'totalCharge' (amount + tip)
            // Here we send the principal amount to backend for session tracking
            // Use 'totalCharge' if backend supported tips, but for now we track proper session closing
            // We'll trust the user paid the tip with the transaction.

            await createPayment(session.id, {
                amount: payAmount,
                tip: calculatedTip,
                paymentMethod: selectedMethod || 'CARD',
            });

            // Store this payment for the receipt
            setLastPayment({
                amount: payAmount,
                tip: calculatedTip,
                method: selectedMethod === 'CARD' ? `Card ending in ${cardDetails.number.slice(-4)}` : 'Mobile Pay',
                date: new Date()
            });

            await fetchPayments();
            const updatedSession = await getSession(session.id);
            setSession(updatedSession);

            setViewState('SUCCESS');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = (type: 'PARTIAL' | 'FULL') => {
        const text = generateReceiptText(type);
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${type.toLowerCase()}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleEmailBill = async () => {
        if (!email || !session) return;

        setSendingEmail(true);
        try {
            // TODO: Implement backend endpoint for emailing bill
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
            alert(`Bill sent to ${email}`);
            setEmail('');
        } catch (err) {
            setError('Failed to send email');
        } finally {
            setSendingEmail(false);
        }
    };

    const generateReceiptText = (type: 'PARTIAL' | 'FULL') => {
        if (!session) return '';
        const dateStr = format(new Date(), 'PPpp');
        let text = '';

        if (type === 'PARTIAL' && lastPayment) {
            text += `
----------------------------------------
       PAYMENT RECEIPT
----------------------------------------
Date:   ${dateStr}
Method: ${lastPayment.method}
Ref:    ${Math.random().toString(36).substr(2, 9).toUpperCase()}

Subtotal: €${lastPayment.amount.toFixed(2)}
Tip:      €${lastPayment.tip.toFixed(2)}
----------------------------------------
TOTAL:    €${(lastPayment.amount + lastPayment.tip).toFixed(2)}
----------------------------------------
Remaining Due: €${remainingBalance.toFixed(2)}
         Thank You!
`;
        } else {
            text += `
========================================
           FINAL BILL
========================================
Session: #${session.id}
Table:   ${session.tableId}
Date:    ${dateStr}

ORDERS:
----------------------------------------
`;
            orders.forEach(o => {
                o.items.forEach(i => {
                    text += `${i.quantity}x ${VISUAL_MENU.find(m => m.id === i.menuItemId)?.name || 'Item'} ... €${i.lineTotal.toFixed(2)}\n`;
                });
            });
            text += `
----------------------------------------
Order Total: €${ordersTotal.toFixed(2)}
Total Paid:  €${totalPaid.toFixed(2)} (inc all tips)
----------------------------------------
        FULLY PAID - THANK YOU
========================================
`;
        }
        return text;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[900px] bg-white md:rounded-3xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* VIEW: PAYMENT FORM (Split Layout) */}
                        {viewState === 'FORM' && (
                            <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                                {/* LEFT: Summary (Dark) */}
                                <div className="w-full md:w-[35%] bg-[#0f1629] p-6 text-white relative flex flex-col justify-between">
                                    {/* Abstract BG */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                    <div className="relative z-10">
                                        <h2 className="text-xl font-bold mb-6">Payment Summary</h2>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Restaurant Bill</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold">€{remainingBalance.toFixed(2)}</span>
                                                    <span className="text-slate-400">due</span>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-300">Total Order</span>
                                                    <span className="font-medium">€{ordersTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-emerald-400">
                                                    <span>Paid so far</span>
                                                    <span>-€{totalPaid.toFixed(2)}</span>
                                                </div>
                                                <div className="h-px bg-white/10 my-2" />
                                                <div className="flex justify-between font-bold">
                                                    <span>Remaining</span>
                                                    <span>€{remainingBalance.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 mt-8">
                                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Table {session?.tableId} • {orders.length} Orders
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Payment Details (Light) */}
                                <div className="w-full md:w-[65%] bg-white p-6 md:p-8 text-slate-900 relative">
                                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="h-5 w-5 text-slate-400" /></button>

                                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Payment Details</h2>

                                    <div className="space-y-6">
                                        {/* Amount Input */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-semibold text-slate-700">Enter Amount</label>
                                                <button onClick={() => setAmount(remainingBalance.toFixed(2))} className="text-xs font-semibold text-violet-600 hover:text-violet-700">Pay Full Bill</button>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder={remainingBalance.toFixed(2)}
                                                    className="w-full h-12 bg-white border border-slate-200 rounded-lg pl-10 pr-4 text-lg font-bold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Tip Selection */}
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Add Tip</label>
                                            <div className="flex gap-2">
                                                {[5, 10, 15, 20].map(pct => (
                                                    <button
                                                        key={pct}
                                                        onClick={() => setTipPercent(pct)}
                                                        className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${tipPercent === pct
                                                            ? 'bg-slate-900 text-white shadow-lg'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {pct}%
                                                    </button>
                                                ))}
                                                <input
                                                    type="number"
                                                    value={tipPercent}
                                                    onChange={(e) => setTipPercent(Number(e.target.value))}
                                                    placeholder="Custom"
                                                    className="w-20 h-10 bg-slate-50 border border-slate-200 rounded-lg px-2 text-center text-sm font-semibold text-slate-900 focus:border-slate-900 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Method Selection (Tab Style) */}
                                        <div className="space-y-4">
                                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                                <button
                                                    onClick={() => setSelectedMethod('CARD')}
                                                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedMethod === 'CARD' || !selectedMethod ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    <CreditCard className="h-4 w-4" /> Credit Card
                                                </button>
                                                <button
                                                    onClick={() => setSelectedMethod('MOBILE_PAY')}
                                                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedMethod === 'MOBILE_PAY' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    <Smartphone className="h-4 w-4" /> Mobile Pay
                                                </button>
                                            </div>

                                            {/* Card Form */}
                                            {(selectedMethod === 'CARD' || !selectedMethod) && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-slate-500 uppercase">Card Number</label>
                                                        <div className="relative">
                                                            <input
                                                                className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-900 focus:ring-0 transition-colors"
                                                                placeholder="0000 0000 0000 0000"
                                                                value={cardDetails.number}
                                                                onChange={e => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                                                                maxLength={19}
                                                            />
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                                                <div className="w-8 h-5 bg-slate-200 rounded-sm" />
                                                                <div className="w-8 h-5 bg-slate-200 rounded-sm" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-slate-500 uppercase">Expiry Date</label>
                                                            <input
                                                                className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-900 focus:ring-0 transition-colors"
                                                                placeholder="MM/YY"
                                                                value={cardDetails.expiry}
                                                                onChange={e => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                                                                maxLength={5}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-slate-500 uppercase">CVC / Cvv</label>
                                                            <input
                                                                className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-900 focus:ring-0 transition-colors"
                                                                placeholder="123"
                                                                type="password"
                                                                maxLength={4}
                                                                value={cardDetails.cvc}
                                                                onChange={e => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-slate-500 uppercase">Cardholder Name</label>
                                                        <input
                                                            className="w-full h-11 bg-white border border-slate-200 rounded-lg px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-900 focus:ring-0 transition-colors"
                                                            placeholder="John Doe"
                                                            value={cardDetails.name}
                                                            onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Mobile Pay Options */}
                                            {selectedMethod === 'MOBILE_PAY' && (
                                                <div className="space-y-3 pt-2">
                                                    <button className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-transform active:scale-[0.98]">
                                                        <SiApple className="h-5 w-5" /> Pay with Apple Pay
                                                    </button>
                                                    <button className="w-full h-12 bg-[#253b80] hover:bg-[#1e306e] text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-transform active:scale-[0.98]">
                                                        <SiPaypal className="h-5 w-5" /> Pay with PayPal
                                                    </button>
                                                    <button className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center gap-2 font-medium transition-transform active:scale-[0.98]">
                                                        <SiGooglepay className="h-10 w-10" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" /> {error}
                                            </div>
                                        )}

                                        <Button
                                            onClick={handlePayment}
                                            disabled={isSubmitting || !amount}
                                            className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold text-lg rounded-xl shadow-xl shadow-slate-900/10 mt-4"
                                        >
                                            {isSubmitting ? 'Processing...' : `Pay €${totalCharge.toFixed(2)}`}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: SUCCESS (PARTIAL) */}
                        {viewState === 'SUCCESS' && (
                            <div className="relative bg-[#0f1629] min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
                                {/* Digital Receipt Style matching Image 1 */}
                                <div className="w-full max-w-sm bg-[#0a0f1e] rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800">
                                    {/* Top Glow */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

                                    <div className="p-8 relative z-10">
                                        {/* Checkmark Icon */}
                                        <div className="flex justify-center mb-6">
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 relative">
                                                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                    <Check className="h-6 w-6 text-white stroke-[3]" />
                                                </div>
                                                <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-25" />
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-bold text-white mb-8 tracking-wide">Payment Success</h2>

                                        <div className="space-y-4 text-sm text-left">
                                            <div className="flex justify-between items-center text-slate-400">
                                                <span>Transaction ID</span>
                                                <span className="text-white font-mono">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-slate-400">
                                                <span>Date & Time</span>
                                                <span className="text-white">{lastPayment?.date ? format(lastPayment.date, 'dd MMM yyyy, p') : '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-slate-400">
                                                <span>Payment Method</span>
                                                <span className="text-white">{lastPayment?.method}</span>
                                            </div>

                                            <div className="my-6 border-b border-dashed border-slate-700" />

                                            <div className="flex justify-between items-center text-slate-400">
                                                <span>Subtotal</span>
                                                <span className="text-white text-lg">€{lastPayment?.amount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-slate-400">
                                                <span>Tip</span>
                                                <span className="text-white text-lg">€{lastPayment?.tip.toFixed(2)}</span>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-slate-700">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-slate-400 pb-1">Total</span>
                                                    <span className="text-3xl font-bold text-white">€{((lastPayment?.amount || 0) + (lastPayment?.tip || 0)).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Jagged Bottom Effect */}
                                    <div className="h-6 w-full bg-[#0a0f1e]"
                                        style={{
                                            clipPath: 'polygon(0% 0%, 0% 100%, 3% 0%, 6% 100%, 9% 0%, 12% 100%, 15% 0%, 18% 100%, 21% 0%, 24% 100%, 27% 0%, 30% 100%, 33% 0%, 36% 100%, 39% 0%, 42% 100%, 45% 0%, 48% 100%, 51% 0%, 54% 100%, 57% 0%, 60% 100%, 63% 0%, 66% 100%, 69% 0%, 72% 100%, 75% 0%, 78% 100%, 81% 0%, 84% 100%, 87% 0%, 90% 100%, 93% 0%, 96% 100%, 99% 0%, 100% 100%)',
                                            background: '#0f1629', // Match modal bg to "cut out"
                                            marginTop: '-1px'
                                        }}
                                    />
                                </div>

                                {/* Email Option */}
                                <div className="mt-8 w-full max-w-sm space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="flex-1 h-12 bg-[#1a1f3a]/50 border border-[#2a2f4a] rounded-xl px-4 text-white focus:outline-none focus:border-violet-500 transition-colors"
                                        />
                                        <Button
                                            onClick={handleEmailBill}
                                            disabled={!email || sendingEmail}
                                            className="h-12 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
                                        >
                                            {sendingEmail ? '...' : <Mail className="h-5 w-5" />}
                                        </Button>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={() => handleDownload('PARTIAL')} className="flex-1 bg-slate-800">
                                            <Download className="h-4 w-4 mr-2" /> Receipt
                                        </Button>
                                        <Button onClick={() => router.push('/review')} className="flex-1 bg-white text-black hover:bg-slate-200">
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
