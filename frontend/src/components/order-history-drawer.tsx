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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0f1629] border-l border-[#1e293b] z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#1e293b]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <Receipt className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Your Orders</h2>
                                    <p className="text-sm text-slate-400">{orders.length} orders placed</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors"
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
                                sortedOrders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* Order Header */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">
                                                Order #{order.id} • {format(new Date(order.createdAt), 'HH:mm')}
                                            </span>
                                            <div className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border", getStatusColor(order.status))}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="bg-[#1a1f3a]/50 border border-[#2a2f4a] rounded-2xl overflow-hidden">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="p-4 border-b border-[#2a2f4a] last:border-0 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 bg-[#2a2f4a] rounded flex items-center justify-center text-xs font-bold text-slate-300">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="text-white font-medium">
                                                            {VISUAL_MENU.find(m => m.id === item.menuItemId)?.name || `Item #${item.menuItemId}`}
                                                        </span>
                                                    </div>
                                                    <span className="text-slate-300">€{item.lineTotal.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="bg-[#1e293b]/50 p-4 flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Total</span>
                                                <span className="text-white font-bold text-lg">€{order.totalAmount.toFixed(2)}</span>
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
