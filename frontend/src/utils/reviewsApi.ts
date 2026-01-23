import api from "../lib/axios";
import { Review } from "@/types/productTypes";

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  reviewCount: number;
  distribution: Record<number, number>;
}

export interface CanReviewResponse {
  success: boolean;
  canReview: boolean;
  reason?: "already_reviewed" | "not_purchased";
  message: string;
  existingReview?: {
    id: string;
    rating: number;
    body: string;
    createdAt: string;
  };
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  review?: Review;
}

// Get reviews for a product
export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  const response = await api.get(
    `/reviews/product/${productId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Check if user can review a product
export const checkCanReview = async (
  productId: string
): Promise<CanReviewResponse> => {
  const response = await api.get(`/reviews/can-review/${productId}`);
  return response.data;
};

// Create a new review
export const createReview = async (
  productId: string,
  rating: number,
  body: string
): Promise<CreateReviewResponse> => {
  const response = await api.post("/reviews", {
    productId,
    rating,
    body,
  });
  return response.data;
};

// Delete a review
export const deleteReview = async (
  reviewId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};
