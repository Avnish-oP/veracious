import { Request, Response } from "express";
import prisma from "../../utils/prisma";

/**
 * Get reviews for a product with pagination
 * Also returns average rating and rating distribution
 */
export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Number(page) || 1;
  const take = Number(limit) || 10;
  const skip = (pageNum - 1) * take;

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    // Calculate average rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    // Calculate rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    allReviews.forEach((review) => {
      // Round to nearest integer for distribution
      const roundedRating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
      if (roundedRating >= 1 && roundedRating <= 5) {
        distribution[roundedRating]++;
      }
    });

    return res.status(200).json({
      success: true,
      reviews,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: allReviews.length,
      distribution,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};
