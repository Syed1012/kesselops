import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfToday } from "date-fns";
import { X, Calendar, Clock, User, Phone, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReservation } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
    const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        guests: 2,
        date: format(startOfToday(), 'yyyy-MM-dd'),
        time: "19:00",
        message: ""
    });

    const validateForm = () => {
        if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
        if (!/^\+?[\d\s-]{8,}$/.test(form.phone)) return "Please enter a valid phone number.";

        const selectedDate = new Date(`${form.date}T${form.time}`);
        if (selectedDate < new Date()) return "Reservation time must be in the future.";

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const reservationTime = `${form.date}T${form.time}:00`;
            await createReservation({
                venueId: 1,
                guestName: form.name,
                guestEmail: form.email,
                guestPhone: form.phone,
                guestNotes: form.message,
                partySize: form.guests,
                reservationTime: reservationTime
            });
            setStep('SUCCESS');
        } catch (err: any) {
            let errorMessage = 'Failed to create reservation';
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep('FORM');
            setError(null);
            setForm({
                name: "",
                email: "",
                phone: "",
                guests: 2,
                date: format(startOfToday(), 'yyyy-MM-dd'),
                time: "19:00",
                message: ""
            });
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-4xl bg-white text-black shadow-2xl rounded-none overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-black transition-colors bg-white/50 rounded-full md:bg-transparent"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Left Side - Image/Promo */}
                        <div className="hidden md:flex w-2/5 bg-neutral-900 relative flex-col justify-between p-8 text-white bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center">
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="relative z-10">
                                <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">Weekend Offer</p>
                                <h2 className="text-4xl font-serif leading-tight">30% OFF<br /><span className="text-lg font-sans font-normal opacity-80">online reservation only</span></h2>
                            </div>
                            <div className="relative z-10 mt-auto">
                                <button className="px-6 py-3 border border-white/30 hover:bg-white hover:text-black transition-all text-xs font-bold tracking-widest uppercase">
                                    Book Now
                                </button>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="flex-1 p-8 md:p-12 relative bg-white">
                            {step === 'FORM' ? (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="text-center md:text-left space-y-2">
                                        <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-600/60">Reservations</p>
                                        <h2 className="text-3xl font-serif text-neutral-900">Book A Table</h2>
                                        <p className="text-sm text-neutral-500">Booking request +88-123-123456 or fill out the order form</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div className="space-y-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Your Name"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600 transition-colors bg-transparent"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1">
                                            <input
                                                required
                                                type="tel"
                                                maxLength={10}
                                                placeholder="Phone Number"
                                                value={form.phone}
                                                onChange={e => {
                                                    // Allow only numbers, +, -, and spaces
                                                    let cleanPhone = e.target.value.replace(/[^0-9+\s-]/g, '');
                                                    // Enforce max 10 characters
                                                    if (cleanPhone.length > 10) {
                                                        cleanPhone = cleanPhone.slice(0, 10);
                                                    }
                                                    setForm({ ...form, phone: cleanPhone });
                                                }}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600 transition-colors bg-transparent"
                                            />
                                        </div>

                                        {/* Email (Hidden in UI image? But required for our flow) */}
                                        <div className="space-y-1 md:col-span-2">
                                            <input
                                                required
                                                type="email"
                                                placeholder="Email Address (for confirmation)"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600 transition-colors bg-transparent"
                                            />
                                        </div>

                                        {/* Guests */}
                                        <div className="space-y-1">
                                            <select
                                                value={form.guests}
                                                onChange={e => setForm({ ...form, guests: parseInt(e.target.value) })}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 focus:outline-none focus:border-amber-600 transition-colors bg-transparent appearance-none cursor-pointer"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                    <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Date */}
                                        <div className="space-y-1">
                                            <input
                                                required
                                                type="date"
                                                min={format(startOfToday(), 'yyyy-MM-dd')}
                                                value={form.date}
                                                onChange={e => {
                                                    // Ensure selected date is not in the past (double protection)
                                                    const selected = new Date(e.target.value);
                                                    const today = startOfToday();
                                                    if (selected < today) return;
                                                    setForm({ ...form, date: e.target.value });
                                                }}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 focus:outline-none focus:border-amber-600 transition-colors bg-transparent uppercase cursor-pointer"
                                                onClick={(e) => e.currentTarget.showPicker()}
                                            />
                                        </div>

                                        {/* Time */}
                                        <div className="space-y-1 md:col-span-2">
                                            <select
                                                required
                                                value={form.time}
                                                onChange={e => setForm({ ...form, time: e.target.value })}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 focus:outline-none focus:border-amber-600 transition-colors bg-transparent appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select Time</option>
                                                {["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-1 md:col-span-2">
                                            <textarea
                                                placeholder="Message"
                                                value={form.message}
                                                onChange={e => setForm({ ...form, message: e.target.value })}
                                                rows={3}
                                                className="w-full border-b border-gray-300 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-600 transition-colors bg-transparent resize-none"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-50 text-red-600 text-sm border-l-2 border-red-500"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 px-8 rounded-full shadow-lg shadow-amber-500/20 text-xs tracking-[0.15em] uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Booking...' : 'Book A Table'}
                                    </button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-center space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                                        <span className="text-4xl">✓</span>
                                    </div>
                                    <h3 className="text-3xl font-serif text-neutral-900">Confirmed!</h3>
                                    <p className="text-neutral-500 max-w-sm mx-auto">
                                        Your table has been reserved. Check your email <strong>{form.email}</strong> for the table code.
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="mt-8 px-8 py-3 border border-neutral-200 hover:border-neutral-900 text-neutral-900 font-bold uppercase text-xs tracking-widest transition-all"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
