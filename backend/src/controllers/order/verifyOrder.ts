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
    if (!verified)
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });

    // Use transaction to ensure data integrity
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

      if (orderRecord.paymentStatus === "PAID") {
        return; // Already paid, idempotent approach
      }

      // update order + payment record
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

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING" as any,
          updatedAt: new Date(),
        },
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

      // 1. Re-verify and Decrement Stock (prevents race condition)
      const items = orderRecord.items as any[];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.quantity) {
            // First check if stock is still available
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true, name: true },
            });
            
            if (!product || product.stock < Number(item.quantity)) {
              throw new Error(
                `Insufficient stock for product ${product?.name || item.productId}. ` +
                `Required: ${item.quantity}, Available: ${product?.stock || 0}`
              );
            }
            
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: Number(item.quantity)
                }
              }
            });
          }
        }
      }

      // 2. Clear Cart
      if (orderRecord.userId) {
        await tx.cart.delete({
          where: { userId: orderRecord.userId },
        }).catch(() => {
           // Ignore if cart doesn't exist
        });
        
        // Remove from Redis
        const redisKey = `cart:${orderRecord.userId}`;
        await redisClient.del(redisKey);
        // Alternatively, if delete cascades or if we just want to clear items:
        // await tx.cartItem.deleteMany({ where: { cart: { userId: orderRecord.userId } } });
      }
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("verifyOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Verification failed" });
  }
};
