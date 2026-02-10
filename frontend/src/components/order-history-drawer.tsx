"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, ChefHat, Utensils, Receipt } from "lucide-react";
import { useSessionStore } from "@/lib/session-store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { VISUAL_MENU } from "@/lib/menu-data";

interface OrderHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OrderHistoryDrawer({ isOpen, onClose }: OrderHistoryDrawerProps) {
    const { orders } = useSessionStore();

    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'KITCHEN': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'READY': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'SERVED': return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4" />;
            case 'KITCHEN': return <ChefHat className="h-4 w-4" />;
            case 'READY': return <CheckCircle2 className="h-4 w-4" />;
            case 'SERVED': return <Utensils className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black/60 backdrop-blur-3xl border-l border-white/10 z-50 flex flex-col shadow-2xl shadow-black/50"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <Receipt className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Your Orders</h2>
                                    <p className="text-sm text-slate-400">{orders.length} orders placed</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Orders List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {sortedOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <Receipt className="h-16 w-16 text-slate-600 mb-4" />
                                    <p className="text-slate-400 text-lg">No orders yet</p>
                                    <p className="text-slate-500 text-sm">Submit an order to track it here</p>
                                </div>
                            ) : (
                                sortedOrders.map((order, orderIndex) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                                                Order #{orderIndex + 1} • {format(new Date(order.createdAt), 'HH:mm')}
                                            </span>
                                            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border backdrop-blur-sm shadow-sm", getStatusColor(order.status))}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm backdrop-blur-sm">
                                            {order.items.map((item) => {
                                                const menuItem = VISUAL_MENU.find(m => m.id === item.menuItemId);
                                                return (
                                                    <div key={item.id} className="p-4 border-b border-white/5 last:border-0 flex justify-between items-center group hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-6 h-6 bg-black/20 rounded-md flex items-center justify-center text-xs font-bold text-white/70 border border-white/5">
                                                                {item.quantity}x
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                {menuItem?.image && (
                                                                    <div className="w-8 h-8 rounded-md overflow-hidden bg-black/20 border border-white/10">
                                                                        <img src={menuItem.image} alt="" className="w-full h-full object-cover opacity-80" />
                                                                    </div>
                                                                )}
                                                                <span className="text-white font-medium text-sm">
                                                                    {menuItem?.name || `Item #${item.menuItemId}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-white/60 text-sm font-variant-numeric">€{item.lineTotal.toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="bg-black/20 p-4 flex justify-between items-center text-sm border-t border-white/5 backdrop-blur-md">
                                                <span className="text-white/50 font-medium">Total</span>
                                                <span className="text-white font-bold text-lg tracking-tight">€{order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
