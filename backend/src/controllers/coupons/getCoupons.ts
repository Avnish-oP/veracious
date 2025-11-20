import prisma from "../../utils/prisma";
import express from "express";
import {
  CouponValidationError,
  validateCouponAndCalculateDiscount,
} from "../../utils/couponValidation";

export const getCouponsByProductId = async (
  req: express.Request,
  res: express.Response
) => {
  const { productId } = req.params;
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: {
          lte: now,
        },
        OR: [
          { validTo: null },
          {
            validTo: {
              gte: now,
            },
          },
        ],
        AND: [
          {
            OR: [
              { isForAllProducts: true },
              {
                applicableProducts: {
                  some: {
                    id: productId,
                  },
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch coupons" });
  }
};

export const getCouponsByValue = async (
  req: express.Request,
  res: express.Response
) => {
  const { orderValue } = req.query;
  try {
    const value = Number(orderValue);
    if (isNaN(value)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order value" });
    }

    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: {
          lte: now,
        },
        OR: [
          { validTo: null },
          {
            validTo: {
              gte: now,
            },
          },
        ],
        isForAllProducts: true,
        minOrderValue: {
          lte: value,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch coupons" });
  }
};

export const applyCouponCode = async (
  req: express.Request,
  res: express.Response
) => {
  const { code, orderValue, productIds } = req.body;
  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Coupon code is required" });
  }

  try {
    const result = await validateCouponAndCalculateDiscount(code, {
      orderValue: Number(orderValue) || 0,
      productIds: Array.isArray(productIds) ? productIds : [],
      userId: (req as any).user?.id,
    });

    return res.status(200).json({
      success: true,
      coupon: result.coupon,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
    });
  } catch (error: any) {
    if (error instanceof CouponValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to apply coupon code" });
  }
};
