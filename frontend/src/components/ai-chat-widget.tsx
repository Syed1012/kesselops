"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiChat, aiRecommendations } from "@/lib/api";
import type { AIChatMessage, AIRecommendation, MenuItem } from "@/lib/api";

interface AIChatWidgetProps {
    venueId?: number;
    sessionId?: number;
    cartItemNames?: string[];
    onAddToCart?: (item: MenuItem) => void;
}

export function AIChatWidget({
    venueId = 1,
    sessionId,
    cartItemNames = [],
    onAddToCart,
}: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
        []
    );
    const [showRecs, setShowRecs] = useState(false);
    const [recsLoading, setRecsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: AIChatMessage = { role: "user", content: trimmed };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setShowRecs(false);

        try {
            const response = await aiChat(trimmed, messages, venueId, sessionId);
            setMessages([
                ...newMessages,
                { role: "assistant", content: response.reply },
            ]);
        } catch {
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content:
                        "I'm having trouble right now. Please try again in a moment. 🙏",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetRecommendations = async () => {
        setRecsLoading(true);
        setShowRecs(true);
        try {
            const response = await aiRecommendations(
                venueId,
                cartItemNames,
                undefined
            );
            setRecommendations(response.recommendations);
        } catch {
            setRecommendations([]);
        } finally {
            setRecsLoading(false);
        }
    };

    const quickActions = [
        { label: "🍸 Best cocktails?", prompt: "What are your best cocktails?" },
        {
            label: "🥩 Main courses",
            prompt: "What main courses do you recommend tonight?",
        },
        { label: "🍰 Desserts", prompt: "What desserts do you have?" },
        { label: "🌱 Vegetarian", prompt: "Do you have any vegetarian options?" },
    ];

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-14 pl-5 pr-6 bg-black/80 backdrop-blur-xl border border-amber-500/50 rounded-full flex items-center gap-3 shadow-2xl shadow-amber-900/40 group transition-all hover:border-amber-400 hover:shadow-amber-500/20"
                    >
                        <div className="relative">
                            <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400/20 animate-pulse" />
                            <div className="absolute inset-0 bg-amber-400/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent font-serif tracking-wider">
                            AI
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        AI Sommelier
                                    </h3>
                                    <p className="text-[10px] text-amber-500/80 uppercase tracking-wider font-medium">
                                        Midnight Lounge
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
                            {/* Welcome message */}
                            {messages.length === 0 && !showRecs && (
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-md p-4 max-w-[90%]">
                                        <p className="text-sm text-white/90 leading-relaxed">
                                            Welcome to Midnight Lounge! ✨ I&apos;m your AI
                                            sommelier. Ask me anything about our menu — cocktails,
                                            pairings, dietary options, or let me surprise you.
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        {quickActions.map((action) => (
                                            <button
                                                key={action.label}
                                                onClick={() => {
                                                    setInput(action.prompt);
                                                    setTimeout(() => {
                                                        setInput(action.prompt);
                                                        const syntheticEvent = {
                                                            trim: () => action.prompt,
                                                        };
                                                        // Trigger send
                                                        const userMsg: AIChatMessage = {
                                                            role: "user",
                                                            content: action.prompt,
                                                        };
                                                        setMessages([userMsg]);
                                                        setIsLoading(true);
                                                        setInput("");
                                                        aiChat(action.prompt, [], venueId, sessionId)
                                                            .then((resp) =>
                                                                setMessages([
                                                                    userMsg,
                                                                    { role: "assistant", content: resp.reply },
                                                                ])
                                                            )
                                                            .catch(() =>
                                                                setMessages([
                                                                    userMsg,
                                                                    {
                                                                        role: "assistant",
                                                                        content:
                                                                            "Sorry, I couldn't process that. Please try again.",
                                                                    },
                                                                ])
                                                            )
                                                            .finally(() => setIsLoading(false));
                                                    }, 50);
                                                }}
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Get Recommendations Button */}
                                    <button
                                        onClick={handleGetRecommendations}
                                        className="w-full py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl text-sm text-amber-400 font-medium hover:from-amber-500/30 hover:to-amber-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Get AI Recommendations
                                    </button>
                                </div>
                            )}

                            {/* Recommendations Panel */}
                            {showRecs && (
                                <div className="space-y-3">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-md p-4">
                                        <p className="text-xs text-amber-500 uppercase tracking-wider font-bold mb-3">
                                            ✨ AI Picks for You
                                        </p>
                                        {recsLoading ? (
                                            <div className="flex items-center gap-2 text-white/40 text-sm py-4">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Analyzing the menu for you...
                                            </div>
                                        ) : recommendations.length > 0 ? (
                                            <div className="space-y-3">
                                                {recommendations.map((rec, i) => (
                                                    <motion.div
                                                        key={rec.item.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-start gap-3 p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-all"
                                                    >
                                                        {rec.item.imageUrl && (
                                                            <div
                                                                className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                                                                style={{
                                                                    backgroundImage: `url(${rec.item.imageUrl})`,
                                                                }}
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-sm font-bold text-white truncate">
                                                                    {rec.item.name}
                                                                </p>
                                                                <span className="text-xs font-bold text-amber-500 flex-shrink-0">
                                                                    €{rec.item.price}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                                                {rec.reason}
                                                            </p>
                                                            {onAddToCart && (
                                                                <button
                                                                    onClick={() => onAddToCart(rec.item)}
                                                                    className="mt-2 text-[10px] px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full hover:bg-amber-500/30 transition-all font-bold uppercase tracking-wider"
                                                                >
                                                                    + Add to Cart
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-white/40">
                                                Couldn&apos;t load recommendations right now. Try
                                                chatting with me instead!
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowRecs(false)}
                                        className="text-xs text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        ← Back to chat
                                    </button>
                                </div>
                            )}

                            {/* Chat Messages */}
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "max-w-[85%]",
                                        msg.role === "user" ? "ml-auto" : "mr-auto"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-amber-500 text-black rounded-br-md"
                                                : "bg-white/5 text-white/90 rounded-tl-md"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="max-w-[85%] mr-auto">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div
                                                className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "0ms" }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "150ms" }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce"
                                                style={{ animationDelay: "300ms" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Bar */}
                        <div className="px-4 py-3 border-t border-white/10 bg-black/50 backdrop-blur-xl">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask about our menu..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                        input.trim() && !isLoading
                                            ? "bg-amber-500 text-black hover:bg-amber-400"
                                            : "bg-white/5 text-white/20"
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-white/20 text-center mt-2">
                                Powered by AI · Midnight Lounge
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
