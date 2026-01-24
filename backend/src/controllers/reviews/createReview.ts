import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import redisClient from "../../lib/redis";

/**
 * Create a new review for a product
 * Only users who have purchased and received the product can review
 */
export const createReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { productId, rating, body } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Validate inputs
  if (!productId || rating === undefined || !body) {
    return res.status(400).json({
      success: false,
      message: "Product ID, rating, and review body are required",
    });
  }

  // Validate rating range (1-5, allowing decimals like 4.5)
  const numericRating = parseFloat(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

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

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Check if the specific product is in any of their delivered orders
    // Order items are stored as JSON, so we need to check within
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "DELIVERED",
      },
      select: {
        items: true,
      },
    });

    // No delivered orders at all
    if (deliveredOrders.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased and received",
      });
    }

    const hasProductInOrders = deliveredOrders.some((order) => {
      const items = order.items as Array<{ productId: string }>;
      return items.some((item) => item.productId === productId);
    });

    if (!hasProductInOrders) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased and received",
      });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: numericRating,
        body: body.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidate cache for this product's reviews
    const cachePattern = `cache:/api/v1/reviews/product/${productId}*`;
    const keys = await redisClient.keys(cachePattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    
    // Also invalidate the product detail cache as it includes reviews
    const productCacheKey = `cache:/api/v1/products/${productId}`;
    await redisClient.del(productCacheKey);

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};
