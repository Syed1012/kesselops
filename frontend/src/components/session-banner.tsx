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
            className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-medium text-white text-sm">Table {tableId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium tracking-wide">
                            {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
                        <Users className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Code</span>
                        <div className="w-px h-3 bg-white/10" />
                        <span className="font-mono text-white font-bold tracking-widest text-sm">{session.sessionCode || '----'}</span>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">Live</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
