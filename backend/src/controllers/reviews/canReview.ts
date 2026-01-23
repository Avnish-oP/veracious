import { Request, Response } from "express";
import prisma from "../../utils/prisma";

/**
 * Check if a user can review a specific product
 * Returns true if user has purchased the product (DELIVERED) and hasn't reviewed yet
 */
export const canReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      canReview: false,
      message: "Authentication required",
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
        canReview: false,
        message: "Product not found",
      });
    }

    // Check if user has already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: "already_reviewed",
        message: "You have already reviewed this product",
        existingReview: {
          id: existingReview.id,
          rating: existingReview.rating,
          body: existingReview.body,
          createdAt: existingReview.createdAt,
        },
      });
    }

    // Check if user has purchased this product in a delivered order
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "DELIVERED",
      },
      select: {
        items: true,
      },
    });

    const hasProductInOrders = deliveredOrders.some((order) => {
      const items = order.items as Array<{ productId: string }>;
      return items.some((item) => item.productId === productId);
    });

    if (!hasProductInOrders) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: "not_purchased",
        message: "You need to purchase and receive this product to review it",
      });
    }

    // User can review
    return res.status(200).json({
      success: true,
      canReview: true,
      message: "You can review this product",
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return res.status(500).json({
      success: false,
      canReview: false,
      message: "Failed to check review eligibility",
    });
  }
};
