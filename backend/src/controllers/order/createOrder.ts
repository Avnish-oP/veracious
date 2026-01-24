import { Request, Response } from "express";

import prisma from "../../utils/prisma";

import { createRazorpayOrder } from "../../services/razorPayService";
import {
  CouponValidationError,
  validateCouponAndCalculateDiscount,
} from "../../utils/couponValidation";

export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { items, addressId, couponCode, shipping, gst } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the order" });
    }

    // Calculate total amount
    let totalAmount = 0;
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, discountPrice: true, stock: true },
    });
    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const enrichedItems = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product with ID ${item.productId} not found` });
      }
      if (product.stock < (Number(item.quantity) || 1)) {
        return res
          .status(400)
          .json({
            message: `Insufficient stock for product ${item.productId}`,
          });
      }
      // Fetch LensPrice if configuration exists
      let lensPriceAmount = 0;
      let enrichedConfig = item.configuration;

      if (item.configuration && item.configuration.lensPriceId) {
          const lensPrice = await prisma.lensPrice.findUnique({
              where: { id: item.configuration.lensPriceId, isActive: true }
          });
          if (lensPrice) {
              lensPriceAmount = Number(lensPrice.price);
              enrichedConfig = {
                  ...item.configuration,
                  lensPrice: lensPriceAmount,
                  lensType: lensPrice.name, // Ensure name is captured
              };
          }
      }

      const price = Number(product.discountPrice ?? product.price) + lensPriceAmount;
      const quantity = Number(item.quantity) || 1;
      totalAmount += price * quantity;
      
      enrichedItems.push({
          ...item,
          quantity,
          configuration: enrichedConfig,
          priceAtPurchase: price, // Verify if this is useful for history
      });
    }
    let discountAmount = 0;
    let appliedCouponId: string | null = null;
    if (couponCode) {
      try {
        const { coupon, discountAmount: validatedDiscount } =
          await validateCouponAndCalculateDiscount(couponCode, {
            orderValue: totalAmount,
            productIds,
            userId,
          });
        discountAmount = validatedDiscount;
        totalAmount -= discountAmount;
        appliedCouponId = coupon.id;
      } catch (error) {
        if (error instanceof CouponValidationError) {
          return res
            .status(400)
            .json({ success: false, message: error.message });
        }
        throw error;
      }
    }

    if (addressId) {
      const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
      });
      if (!address) {
        return res
          .status(400)
          .json({ message: "Invalid address or address does not belong to user" });
      }
    }

    // Apply shipping and GST charges
    if (shipping) {
      totalAmount += Number(shipping);
    }
    if (gst) {
      totalAmount += (totalAmount * Number(gst)) / 100;
    }

    // Round to 2 decimal places to avoid floating point issues
    totalAmount = Math.round(totalAmount * 100) / 100;

    const order = await prisma.order.create({
      data: {
        userId,
        items: enrichedItems as any,
        totalAmount: Number(totalAmount),
        discount: Number(discountAmount),
        finalAmount: Number(totalAmount),
        currency: "INR",
        paymentStatus: "PENDING",
        status: "PENDING",
        addressId: addressId || null,
        couponId: appliedCouponId,
      },
    });

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(totalAmount, "INR", userId);
    if (!razorpayOrder) {
      return res
        .status(500)
        .json({ message: "Failed to create Razorpay order" });
    }

    // Save order details to the database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });
    return res.status(201).json({
      success: true,
      orderId: order.id,
      razorpay: {
        key_id: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
    });
  } catch (error: any) {
    console.error("Error creating order:", error);

    // Log detailed error information
    if (error.error) {
      console.error(
        "Razorpay Error Details:",
        JSON.stringify(error.error, null, 2)
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.error : undefined,
    });
  }
};
