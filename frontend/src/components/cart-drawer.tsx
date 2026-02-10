"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore, selectCartTotal, selectCartItemCount } from "@/lib/session-store";
import { createOrder } from "@/lib/api";
import { useState } from "react";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateQuantity: (cartItemId: number, quantity: number) => void;
    onRemoveFromCart: (cartItemId: number) => void;
    onOrderPlaced?: () => void;
}

export function CartDrawer({ isOpen, onClose, onUpdateQuantity, onRemoveFromCart, onOrderPlaced }: CartDrawerProps) {
    const { cart, session, clearCart, addOrder, setLoading, setError } = useSessionStore();
    const cartTotal = useSessionStore(selectCartTotal);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitOrder = async () => {
        if (!session || cart.length === 0) return;

        setIsSubmitting(true);
        setLoading(true);

        try {
            const order = await createOrder(session.id, {
                items: cart.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            });

            addOrder(order);
            clearCart();
            onOrderPlaced?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit order');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
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
                                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Your Cart</h2>
                                    <p className="text-sm text-slate-400">{cart.length} items</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag className="h-16 w-16 text-slate-600 mb-4" />
                                    <p className="text-slate-400 text-lg">Your cart is empty</p>
                                    <p className="text-slate-500 text-sm">Add items from the menu to get started</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-[#1a1f3a]/50 border border-[#2a2f4a] rounded-2xl p-4"
                                    >
                                        <div className="flex gap-4">
                                            {item.menuItemImage && (
                                                <div className="w-20 h-20 rounded-xl bg-[#1e293b] overflow-hidden shrink-0">
                                                    <img
                                                        src={item.menuItemImage}
                                                        alt={item.menuItemName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white truncate">{item.menuItemName}</h3>
                                                <p className="text-violet-400 font-medium">
                                                    €{item.unitPrice.toFixed(2)}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 bg-[#1e293b] hover:bg-[#2a2f4a] rounded-lg flex items-center justify-center transition-colors"
                                                        >
                                                            <Minus className="h-4 w-4 text-slate-300" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 bg-[#1e293b] hover:bg-[#2a2f4a] rounded-lg flex items-center justify-center transition-colors"
                                                        >
                                                            <Plus className="h-4 w-4 text-slate-300" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => onRemoveFromCart(item.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-[#2a2f4a] flex justify-between">
                                            <span className="text-sm text-slate-400">Line total</span>
                                            <span className="font-medium text-white">
                                                €{(item.unitPrice * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-[#1e293b] space-y-4">
                                <div className="flex justify-between text-lg">
                                    <span className="text-slate-300">Total</span>
                                    <span className="font-bold text-white">€{cartTotal.toFixed(2)}</span>
                                </div>
                                <Button
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting || !session}
                                    className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-violet-600/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        "Submit Order"
                                    )}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Floating cart button with item count badge
 */
export function CartButton({ onClick }: { onClick: () => void }) {
    const itemCount = useSessionStore(selectCartItemCount);

    if (itemCount === 0) return null;

    return (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-6 right-6 z-30 w-16 h-16 bg-violet-600 hover:bg-violet-700 rounded-full shadow-2xl shadow-violet-600/40 flex items-center justify-center"
        >
            <ShoppingBag className="h-7 w-7 text-white" />
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-7 h-7 bg-white text-violet-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
            >
                {itemCount}
            </motion.div>
        </motion.button>
    );
}
