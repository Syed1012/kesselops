"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, QrCode } from 'lucide-react';

export default function ReviewPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-white text-black rounded-3xl overflow-hidden shadow-2xl relative"
            >
                {/* Header Section - App Theme (Amber) */}
                <div className="bg-amber-500 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <h1 className="relative z-10 text-2xl font-bold text-black leading-tight mb-2">
                        Are you impressed<br />with our service?
                    </h1>
                </div>

                {/* Subhead Section */}
                <div className="bg-amber-200 p-4 text-center">
                    <p className="font-medium text-amber-900 text-sm">
                        Make our day by leaving<br />us a 5 star review!
                    </p>
                </div>

                {/* Content Body */}
                <div className="p-8 flex flex-col items-center space-y-6 bg-white">
                    {/* Google Logo Mock */}
                    <div className="flex items-center gap-1 scale-110">
                        <span className="text-4xl font-sans font-bold text-[#4285F4]">G</span>
                        <span className="text-4xl font-sans font-bold text-[#EA4335]">o</span>
                        <span className="text-4xl font-sans font-bold text-[#FBBC05]">o</span>
                        <span className="text-4xl font-sans font-bold text-[#4285F4]">g</span>
                        <span className="text-4xl font-sans font-bold text-[#34A853]">l</span>
                        <span className="text-4xl font-sans font-bold text-[#EA4335]">e</span>
                    </div>

                    {/* 5 Stars */}
                    <div className="flex gap-1 my-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                            >
                                <Star className="w-10 h-10 fill-amber-500 text-amber-500 drop-shadow-sm" />
                            </motion.div>
                        ))}
                    </div>

                    {/* QR Placeholder */}
                    <div className="relative group cursor-pointer">
                        <div className="w-48 h-48 border-4 border-black rounded-2xl flex items-center justify-center bg-white relative overflow-hidden">
                            {/* Simulated QR Code Pattern */}
                            <div className="absolute inset-0 p-4 grid grid-cols-4 gap-2 opacity-80">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className={`bg-black rounded-sm ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} />
                                ))}
                            </div>
                            {/* Corner Markers */}
                            <div className="absolute top-3 left-3 w-8 h-8 border-4 border-black" />
                            <div className="absolute top-3 right-3 w-8 h-8 border-4 border-black" />
                            <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-black" />

                            <QrCode className="w-16 h-16 text-amber-600 relative z-10 bg-white p-1 rounded-lg shadow-sm" />
                        </div>

                        {/* Scan Me Pill */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-bold px-6 py-1.5 rounded-full shadow-lg whitespace-nowrap border-2 border-white text-sm"
                        >
                            Scan me!
                        </motion.div>
                    </div>

                    <p className="text-xs text-gray-400 font-medium mt-4">Google Account Required</p>
                </div>
            </motion.div>

            {/* Done Button */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => router.push('/table/session')}
                className="mt-12 px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full shadow-amber-900/40 shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-sm flex items-center gap-2"
            >
                Done
            </motion.button>

        </main>
    );
}
