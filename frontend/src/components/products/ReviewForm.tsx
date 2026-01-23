"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface ReviewFormProps {
  productId: string;
  onSubmit: (rating: number, body: string) => Promise<void>;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSubmit,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (body.trim().length < 10) {
      setError("Review must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(rating, body.trim());
      setSuccess(true);
      setRating(0);
      setBody("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get label for rating
  const getRatingLabel = (r: number) => {
    if (r === 0) return "Select a rating";
    if (r <= 1) return "Poor";
    if (r <= 2) return "Fair";
    if (r <= 3) return "Good";
    if (r <= 4) return "Very Good";
    return "Excellent";
  };

  const activeRating = hoverRating || rating;

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-emerald-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-2">Thank you for your review!</h4>
        <p className="text-gray-600">Your feedback helps other customers make informed decisions.</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200"
    >
      <h4 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h4>

      {/* Star Rating Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Your Rating
        </label>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    star <= activeRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 hover:text-amber-200"
                  )}
                />
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={activeRating}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                activeRating === 0
                  ? "bg-gray-100 text-gray-500"
                  : activeRating <= 2
                  ? "bg-orange-100 text-orange-700"
                  : activeRating <= 3
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-emerald-100 text-emerald-700"
              )}
            >
              {getRatingLabel(activeRating)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Review Body */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Your Review
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience with this product. What did you like or dislike?"
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all placeholder:text-gray-400"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Minimum 10 characters</span>
          <span className={cn(
            "text-xs",
            body.length < 10 ? "text-gray-400" : "text-gray-500"
          )}>
            {body.length}/1000
          </span>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0 || body.trim().length < 10}
        className={cn(
          "w-full sm:w-auto px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          rating > 0 && body.trim().length >= 10
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Review
          </>
        )}
      </button>
    </motion.form>
  );
};
