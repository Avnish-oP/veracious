import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import redisClient from "../../lib/redis";

/**
 * Delete a user's own review
 */
export const deleteReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { reviewId } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    const productId = review.productId;

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Invalidate cache for this product's reviews
    const cachePattern = `cache:/api/v1/reviews/product/${productId}*`;
    const keys = await redisClient.keys(cachePattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    
    // Also invalidate the product detail cache
    const productCacheKey = `cache:/api/v1/products/${productId}`;
    await redisClient.del(productCacheKey);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
