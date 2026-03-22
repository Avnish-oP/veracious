import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import redisClient from "../../lib/redis";
import { verifyRazorpaySignature } from "../../services/razorPayService";

export const verifyOrder = async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const verified = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!verified) {
      // Mark order as payment failed when signature verification fails
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
          status: "PAYMENT_FAILED" as any,
          updatedAt: new Date(),
        },
      });
      
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Use transaction to ensure data integrity
    // Store userId for Redis cleanup after transaction
    let userIdForCacheCleanup: string | null = null;
    
    await prisma.$transaction(async (tx) => {
      const orderRecord = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          finalAmount: true,
          couponId: true,
          userId: true,
          items: true,
          paymentStatus: true,
        },
      });

      if (!orderRecord) {
        throw new Error("Order not found");
      }

      // Atomically mark order as paid — only one processor (verify OR webhook) can win
      const updateResult = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: "PENDING" },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING" as any,
          updatedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        // Already processed (by webhook or a concurrent verify call) — return idempotently
        return;
      }

      // Store for cache cleanup after transaction (only if we won the atomic update)
      userIdForCacheCleanup = orderRecord.userId;

      // Create payment record
      await tx.payment.create({
        data: {
          orderId,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          amount: Number(orderRecord.finalAmount || 0),
          currency: "INR",
          paymentMethod: "RAZORPAY",
          paymentStatus: "CAPTURED",
          rawResponse: { verifiedAt: new Date().toISOString() },
        } as any,
      });


      if (orderRecord.couponId && orderRecord.userId) {
        await tx.redeemedCoupon.upsert({
          where: {
            userId_couponId: {
              userId: orderRecord.userId,
              couponId: orderRecord.couponId,
            },
          },
          update: {
            redeemedAt: new Date(),
          },
          create: {
            userId: orderRecord.userId,
            couponId: orderRecord.couponId,
          },
        });
      }

      // 1. Atomically decrement stock (prevents race condition)
      // Uses WHERE stock >= quantity so only one concurrent request can succeed
      const items = orderRecord.items as any[];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.quantity) {
            const result = await tx.product.updateMany({
              where: { 
                id: item.productId, 
                stock: { gte: Number(item.quantity) } 
              },
              data: {
                stock: { decrement: Number(item.quantity) }
              }
            });
            
            if (result.count === 0) {
              throw new Error(
                `Insufficient stock for product ${item.productId}. ` +
                `Required: ${item.quantity}`
              );
            }
          }
        }
      }

      // 2. Clear Cart (database part only)
      if (orderRecord.userId) {
        await tx.cart.delete({
          where: { userId: orderRecord.userId },
        }).catch(() => {
           // Ignore if cart doesn't exist
        });
      }
    }, {
      maxWait: 10000, // 10 seconds max wait to acquire connection
      timeout: 30000, // 30 seconds transaction timeout for large orders
    });

    // 3. Clear cart from Redis AFTER transaction completes (outside transaction)
    if (userIdForCacheCleanup) {
      const redisKey = `cart:${userIdForCacheCleanup}`;
      await redisClient.del(redisKey).catch((err) => {
        console.warn("Failed to clear cart cache:", err);
      });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("verifyOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Verification failed" });
  }
};
