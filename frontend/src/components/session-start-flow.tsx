"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Check, Play, ArrowRight, Table } from "lucide-react";
import { useState } from "react";
import { startSession } from "@/lib/api";
import { type Session } from "@/lib/api";

interface SessionStartFlowProps {
    isOpen: boolean;
    tableId: number;
    onSessionStarted: (session: Session) => void;
    onJoinRequired: () => void;
    onClose: () => void;
}

export function SessionStartFlow({ isOpen, tableId, onSessionStarted, onJoinRequired, onClose }: SessionStartFlowProps) {
    const [step, setStep] = useState<'PROMPT' | 'SUCCESS'>('PROMPT');
    const [sessionCode, setSessionCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStart = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const session = await startSession(tableId);
            // Check if we got a valid session.
            if (session.sessionCode) {
                setSessionCode(session.sessionCode);
                setStep('SUCCESS');
                onSessionStarted(session);
            } else {
                throw new Error("Invalid session data returned");
            }
        } catch (err: any) {
            console.error("Start Session Error:", err);
            // If backend says "Active Session", we should join instead.
            // API throws error with message usually.
            if (err.message && err.message.toLowerCase().includes('join')) {
                onJoinRequired();
            } else {
                setError("Could not start session. Please try again or ask staff.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!sessionCode) return;
        navigator.clipboard.writeText(sessionCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        key={step}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        className="relative z-10 w-full max-w-sm bg-[#0f1629] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Glassy Glow */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                        {step === 'PROMPT' && (
                            <div className="relative text-center space-y-6 pt-4">
                                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 mb-4 animate-pulse">
                                    <Table className="w-10 h-10 text-amber-500" />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Table {tableId}</h2>
                                    <p className="text-sm text-slate-400">
                                        You are the first one here! Start a new ordering session for your group.
                                    </p>
                                </div>

                                {error && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">{error}</p>}

                                <Button
                                    onClick={handleStart}
                                    disabled={isLoading}
                                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-lg font-bold rounded-full shadow-lg shadow-amber-500/20 border-t border-white/20 transition-all hover:scale-[1.02]"
                                >
                                    {isLoading ? 'Starting...' : 'Start Session'}
                                </Button>

                                <div className="pt-2">
                                    <p className="text-xs text-slate-500 mb-2">Joining friends?</p>
                                    <Button
                                        variant="outline"
                                        onClick={onJoinRequired}
                                        className="w-full h-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-amber-500 hover:text-amber-400 font-medium transition-all"
                                    >
                                        Enter Session Code
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 'SUCCESS' && (
                            <div className="relative text-center space-y-6 pt-4">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-4">
                                    <Check className="w-10 h-10 text-emerald-500" />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Session Active!</h2>
                                    <p className="text-sm text-slate-400">
                                        Share code with your table:
                                    </p>
                                </div>

                                <button
                                    onClick={handleCopy}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/50 hover:bg-black/60 transition-all group active:scale-95"
                                >
                                    <span className="text-3xl font-mono font-bold text-white tracking-[0.2em] pl-2 drop-shadow-md">
                                        {sessionCode}
                                    </span>
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-amber-500/20'}`}>
                                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />}
                                    </div>
                                </button>

                                {copied && <p className="text-xs text-emerald-400 font-medium animate-in fade-in slide-in-from-bottom-1">Copied to clipboard!</p>}

                                <Button
                                    onClick={onClose}
                                    className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl"
                                >
                                    Continue to Menu <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
