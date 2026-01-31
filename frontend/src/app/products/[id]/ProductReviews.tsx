"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import { Product } from "@/types/productTypes";
import { ReviewSummary } from "@/components/products/ReviewSummary";
import { ReviewForm } from "@/components/products/ReviewForm";
import { checkCanReview, createReview, CanReviewResponse } from "@/utils/reviewsApi";
import { useUser } from "@/hooks/useUser";

interface ProductReviewsProps {
  product: Product;
  onReviewSubmitted?: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  onReviewSubmitted,
}) => {
  const { user, isLoading: isAuthLoading } = useUser();
  const [canReviewData, setCanReviewData] = useState<CanReviewResponse | null>(null);
  const [isCheckingReview, setIsCheckingReview] = useState(false);

  // Calculate review stats
  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount > 0
    ? product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;
  const distribution: Record<number, number> = {
    5: product.reviews?.filter((r) => Math.round(r.rating) === 5).length || 0,
    4: product.reviews?.filter((r) => Math.round(r.rating) === 4).length || 0,
    3: product.reviews?.filter((r) => Math.round(r.rating) === 3).length || 0,
    2: product.reviews?.filter((r) => Math.round(r.rating) === 2).length || 0,
    1: product.reviews?.filter((r) => Math.round(r.rating) === 1).length || 0,
  };

  // Check if user can review
  useEffect(() => {
    const checkReviewAbility = async () => {
      if (!user) {
        setCanReviewData(null);
        return;
      }
      setIsCheckingReview(true);
      try {
        const response = await checkCanReview(product.id);
        setCanReviewData(response);
      } catch (error) {
        console.error("Error checking review ability:", error);
      } finally {
        setIsCheckingReview(false);
      }
    };
    checkReviewAbility();
  }, [user, product.id]);

  const handleSubmitReview = async (rating: number, body: string) => {
    await createReview(product.id, rating, body);
    onReviewSubmitted?.();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
          <MessageSquare className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-sm text-gray-500">
            {reviewCount > 0 
              ? `${reviewCount} review${reviewCount > 1 ? 's' : ''} from verified buyers`
              : 'Be the first to share your experience'
            }
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Summary & Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Review Summary - Show if there are reviews */}
          {reviewCount > 0 && (
            <ReviewSummary
              averageRating={averageRating}
              reviewCount={reviewCount}
              distribution={distribution}
            />
          )}

          {/* Review Form Section - Only show if user can review or has already reviewed */}
          {(canReviewData?.canReview || canReviewData?.reason === "already_reviewed") && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {isAuthLoading || isCheckingReview ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ) : canReviewData?.canReview ? (
                // User can review
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h4>
                  <ReviewForm
                    productId={product.id}
                    onSubmit={handleSubmitReview}
                    onSuccess={() => window.location.reload()}
                  />
                </div>
              ) : canReviewData?.reason === "already_reviewed" ? (
                // Already reviewed
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Your Review</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i < (canReviewData.existingReview?.rating || 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {canReviewData.existingReview?.createdAt &&
                        new Date(canReviewData.existingReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{canReviewData.existingReview?.body}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Column - Reviews List */}
        <div className="lg:col-span-2">
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {(review.user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {review.user?.name || "Verified Customer"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex bg-amber-50 px-2 py-1 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.round(review.rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.body}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="mb-4 bg-gray-50 p-4 rounded-full w-fit mx-auto">
                <Star className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h4>
              <p className="text-gray-500">Be the first to share your thoughts on this product!</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
