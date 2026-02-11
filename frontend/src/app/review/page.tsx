"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode, Star } from "lucide-react";

const DEFAULT_REVIEW_FORM_URL = "http://localhost:3000/review/submit";

export default function ReviewPage() {
  const router = useRouter();
  const [reviewFormUrl, setReviewFormUrl] = useState(DEFAULT_REVIEW_FORM_URL);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReviewFormUrl(`${window.location.origin}/review/submit`);
    }
  }, []);

  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(reviewFormUrl)}`;
  }, [reviewFormUrl]);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-amber-500 p-8 text-center text-black">
          <h1 className="text-2xl font-bold leading-tight">
            Scan to Leave
            <br />
            Your Review
          </h1>
          <p className="text-sm font-medium mt-2">
            One QR for all venues in this MVP
          </p>
        </div>

        <div className="p-8 bg-card flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400" />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-lg">
            <img
              src={qrImageUrl}
              alt="Customer review QR code"
              className="w-64 h-64 object-contain"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              Scan this code and share your feedback
            </p>
            <p className="text-[11px] text-muted-foreground break-all max-w-xs">
              {reviewFormUrl}
            </p>
          </div>

          <button
            onClick={() => router.push("/review/submit")}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            Open Review Form
          </button>
        </div>
      </motion.div>
    </main>
  );
}
