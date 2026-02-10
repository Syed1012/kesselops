"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Clock } from "lucide-react";
import { useSessionStore } from "@/lib/session-store";

export function SessionBanner() {
    const { session, tableId } = useSessionStore();

    if (!session) return null;

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg shadow-violet-600/20"
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white/80" />
                        <span className="font-semibold text-white">Table {tableId}</span>
                    </div>
                    <div className="w-px h-5 bg-white/20" />
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-white/80" />
                        <span className="text-white/80 text-sm">
                            Session started at {new Date(session.startedAt).toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                        <Users className="h-4 w-4 text-amber-300" />
                        <span className="text-white/60 text-xs uppercase tracking-wider font-bold">Share Code:</span>
                        <span className="font-mono text-amber-300 font-bold tracking-widest">{session.sessionCode || '----'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-white/80">Active</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
