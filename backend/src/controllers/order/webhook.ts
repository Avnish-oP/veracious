import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../../utils/prisma";
import redisClient from "../../lib/redis";
import { sendOrderConfirmationEmail } from "../../email/sendmail";

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
    
    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const rpOrderId = event.payload.payment.entity.order_id;
      const rpPaymentId = event.payload.payment.entity.id;

      // Store data for post-transaction operations
      let userIdForCacheCleanup: string | null = null;
      let orderDataForEmail: any = null;

      await prisma.$transaction(async (tx) => {
        const orderRecord = await tx.order.findFirst({
          where: { razorpayOrderId: rpOrderId } as any,
          select: {
             id: true,
             paymentStatus: true,
             userId: true,
             couponId: true,
             items: true,
             totalAmount: true,
             discount: true,
             finalAmount: true,
             address: {
               select: {
                 line1: true,
                 line2: true,
                 city: true,
                 state: true,
                 postal: true,
                 country: true,
               }
             },
             user: {
               select: {
                 name: true,
                 email: true,
               }
             }
          }
        });

        if (!orderRecord) {
          // Log orphan payment for manual investigation
          console.error(`[ORPHAN PAYMENT] Order not found for Razorpay Order ID: ${rpOrderId}, Payment ID: ${rpPaymentId}`);
          return;
        }

        if (orderRecord.paymentStatus === "PAID") {
          return; // Already processed
        }

        // Store data for post-transaction operations
        userIdForCacheCleanup = orderRecord.userId;
        orderDataForEmail = orderRecord;

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

        // Decrement Stock
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

        // Clear Cart (within transaction)
        if (orderRecord.userId) {
          await tx.cart.delete({
            where: { userId: orderRecord.userId },
          }).catch(() => {
            // Ignore if cart doesn't exist
          });
        }
      }, {
        maxWait: 10000,
        timeout: 30000,
      });

      // Clear Redis cache outside transaction to prevent timeout
      if (userIdForCacheCleanup) {
        const redisKey = `cart:${userIdForCacheCleanup}`;
        await redisClient.del(redisKey);
      }

      // Send order confirmation email (non-blocking)
      if (orderDataForEmail?.user?.email) {
        const items = orderDataForEmail.items as any[];
        // Get product details for email
        const productIds = items.map((item: any) => item.productId).filter(Boolean);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            images: { take: 1, select: { url: true } },
          },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        const emailData = {
          id: orderDataForEmail.id,
          items: items.map((item: any) => {
            const product = productMap.get(item.productId);
            return {
              productName: product?.name || item.productName || 'Product',
              productImage: product?.images[0]?.url || null,
              quantity: item.quantity,
              price: Number(item.price),
              configuration: item.configuration,
            };
          }),
          totalAmount: Number(orderDataForEmail.totalAmount),
          discount: Number(orderDataForEmail.discount),
          finalAmount: Number(orderDataForEmail.finalAmount),
          address: orderDataForEmail.address,
          userName: orderDataForEmail.user.name,
        };

        sendOrderConfirmationEmail(orderDataForEmail.user.email, emailData);
      }
    }

    // Handle payment.failed event
    if (event.event === "payment.failed") {
      const rpOrderId = event.payload.payment.entity.order_id;
      const rpPaymentId = event.payload.payment.entity.id;
      const failureReason = event.payload.payment.entity.error_description || "Payment failed";

      console.log(`[PAYMENT FAILED] Order: ${rpOrderId}, Payment: ${rpPaymentId}, Reason: ${failureReason}`);

      await prisma.$transaction(async (tx) => {
        const orderRecord = await tx.order.findFirst({
          where: { razorpayOrderId: rpOrderId } as any,
          select: { id: true, paymentStatus: true }
        });

        if (!orderRecord) {
          console.error(`[ORPHAN FAILED PAYMENT] Order not found for Razorpay Order ID: ${rpOrderId}`);
          return;
        }

        // Only update if not already paid (payment might have succeeded on retry)
        if (orderRecord.paymentStatus === "PAID") {
          return;
        }

        // Mark order as payment failed
        await tx.order.update({
          where: { id: orderRecord.id },
          data: { 
            paymentStatus: "FAILED", 
            status: "PAYMENT_FAILED" as any, 
            updatedAt: new Date() 
          },
        });

        // Store failed payment record for debugging
        await tx.payment.create({
          data: {
            orderId: orderRecord.id,
            paymentId: rpPaymentId,
            razorpayOrderId: rpOrderId,
            amount: Number(event.payload.payment.entity.amount) / 100,
            currency: event.payload.payment.entity.currency,
            paymentMethod: event.payload.payment.entity.method || "RAZORPAY",
            paymentStatus: "FAILED",
            rawResponse: event,
          } as any,
        });
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).send("error");
  }
};
