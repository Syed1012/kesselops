import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinSessionModalProps {
    isOpen: boolean;
    onJoin: (code: string) => void;
    isLoading: boolean;
    error: string | null;
}

export function JoinSessionModal({ isOpen, onJoin, isLoading, error }: JoinSessionModalProps) {
    const [code, setCode] = useState(["", "", "", ""]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1]; // Take last char
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-advance
        if (value && index < 3) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onJoin(code.join(""));
    };

    const isComplete = code.every(c => c !== "");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
                    >
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-serif text-white mb-2">Join Table</h2>
                                <p className="text-white/60 text-sm">
                                    There is already an active session. Ask your friends for the 4-digit code.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex justify-center gap-3">
                                    {code.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`code-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            className="w-14 h-16 rounded-xl bg-white/5 border border-white/10 text-center text-3xl font-bold text-white focus:border-amber-500 focus:bg-white/10 outline-none transition-all"
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-center text-sm bg-red-500/10 py-2 rounded-lg"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={!isComplete || isLoading}
                                    className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-sm rounded-xl transition-all"
                                >
                                    {isLoading ? "Joining..." : "Join Session"}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
