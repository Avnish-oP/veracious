import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../../utils/prisma";
import redisClient from "../../lib/redis";

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = (req as any).rawBody || JSON.stringify(req.body);
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    if (expected !== signature) {
      return res.status(400).send("invalid signature");
    }

    const event = req.body;
    if (event.event === "payment.captured") {
      const rpOrderId = event.payload.payment.entity.order_id;
      const rpPaymentId = event.payload.payment.entity.id;

      await prisma.$transaction(async (tx) => {
        const orderRecord = await tx.order.findFirst({
          where: { razorpayOrderId: rpOrderId } as any,
          select: {
             id: true,
             paymentStatus: true,
             userId: true,
             couponId: true,
             items: true,
          }
        });

        if (!orderRecord) {
           // If order not found, we can't do anything. Return 200 to acknowledge webhook.
           console.error(`Order not found for Razorpay Order ID: ${rpOrderId}`);
           return;
        }

        if (orderRecord.paymentStatus === "PAID") {
          return; // Already processed
        }

        // mark order paid
        await tx.order.update({
          where: { id: orderRecord.id },
          data: { paymentStatus: "PAID", status: "PROCESSING" as any, updatedAt: new Date() },
        });

        await tx.payment.create({
          data: {
            orderId: orderRecord.id,
            paymentId: rpPaymentId,
            razorpayOrderId: rpOrderId,
            amount: Number(event.payload.payment.entity.amount) / 100,
            currency: event.payload.payment.entity.currency,
            paymentMethod: event.payload.payment.entity.method || "RAZORPAY",
            paymentStatus: "CAPTURED",
            rawResponse: event,
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

        // 1. Decrement Stock
        const items = orderRecord.items as any[];
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.productId && item.quantity) {
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
          });
          
          // Remove from Redis
          const redisKey = `cart:${orderRecord.userId}`;
          await redisClient.del(redisKey);
        }
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).send("error");
  }
};
