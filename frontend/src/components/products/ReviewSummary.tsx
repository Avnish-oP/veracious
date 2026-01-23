"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
  distribution: Record<number, number>;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  reviewCount,
  distribution,
}) => {
  // Calculate percentage for each rating level
  const getPercentage = (count: number) => {
    return reviewCount > 0 ? (count / reviewCount) * 100 : 0;
  };

  // Render stars with partial fill support
  const renderStars = (rating: number, size: "sm" | "lg" = "lg") => {
    const starSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(Math.max(rating - star + 1, 0), 1);
          return (
            <div key={star} className="relative">
              {/* Background star (gray) */}
              <Star className={cn(starSize, "text-gray-200")} />
              {/* Filled star (amber) with clip */}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(starSize, "text-amber-400 fill-amber-400")} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-3xl p-6 sm:p-8 border border-amber-100/50"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Overall Rating */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative">
            <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {averageRating.toFixed(1)}
            </div>
            <div className="absolute -top-2 -right-4 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {renderStars(averageRating)}
          </div>
          
          <p className="text-gray-500 text-sm">
            Based on <span className="font-semibold text-gray-700">{reviewCount}</span> {reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Right: Distribution Bars */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating] || 0;
            const percentage = getPercentage(count);
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-14 text-sm text-gray-600">
                  <span className="font-medium">{rating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * (5 - rating), ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      rating >= 4
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : rating === 3
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : "bg-gradient-to-r from-orange-400 to-red-400"
                    )}
                  />
                </div>
                
                <span className="w-12 text-right text-sm text-gray-500 tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
