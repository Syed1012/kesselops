"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitPublicReview } from "@/lib/api";

const RATING_VALUES = [1, 2, 3, 4, 5];

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-2">
        {RATING_VALUES.map((rating) => (
          <button
            type="button"
            key={rating}
            onClick={() => onChange(rating)}
            className="transition-transform hover:scale-110"
            aria-label={`${label} ${rating} stars`}
          >
            <Star
              className={`h-7 w-7 ${
                rating <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-600"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">{value}/5</span>
      </div>
    </div>
  );
}

export default function ReviewSubmitPage() {
  const [rating, setRating] = useState(5);
  const [staffBehaviorRating, setStaffBehaviorRating] = useState(5);
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please write a short review description");
      return;
    }

    setIsSubmitting(true);
    const response = await submitPublicReview({
      reviewerName: reviewerName.trim() || undefined,
      rating,
      staffBehaviorRating,
      comment: comment.trim(),
    });

    if (response.success) {
      setSubmitted(true);
      toast.success("Thanks for your feedback!");
    } else {
      toast.error(response.error || "Failed to submit review");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8"
      >
        {submitted ? (
          <div className="text-center space-y-4 py-8">
            <h1 className="text-2xl font-bold text-foreground">Review Submitted</h1>
            <p className="text-muted-foreground">
              Thank you. Your review is now visible in owner dashboard reviews.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setRating(5);
                setStaffBehaviorRating(5);
                setReviewerName("");
                setComment("");
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 px-5 rounded-lg transition-colors"
            >
              Submit Another Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Leave a Review</h1>
              <p className="text-sm text-muted-foreground">
                Please rate your overall experience and our staff behavior.
              </p>
            </div>

            <StarRating
              label="Overall Experience"
              value={rating}
              onChange={setRating}
            />

            <StarRating
              label="Staff Behavior"
              value={staffBehaviorRating}
              onChange={setStaffBehaviorRating}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Guest"
                maxLength={120}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us how your visit went..."
                rows={5}
                maxLength={2000}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/70 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
