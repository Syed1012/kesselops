"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { useEffect } from "react";

interface WaiterNotificationProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WaiterNotification({ isOpen, onClose }: WaiterNotificationProps) {
    // Auto-close after 3 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                >
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[320px]">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/20 shrink-0">
                            <Bell className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-base leading-tight">Waiter Notified</h3>
                            <p className="text-white/60 text-sm">Someone will be with you shortly.</p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <Check className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
