import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../../utils/prisma";

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
      const orderRecord = await prisma.order.findFirst({
        where: { razorpayOrderId: rpOrderId } as any,
      });

      if (!orderRecord) {
        return res.status(404).send("order not found");
      }
      // mark order paid
      await prisma.order.updateMany({
        where: { razorpayOrderId: rpOrderId } as any,
        data: { paymentStatus: "PAID", status: "PROCESSING" as any },
      });

      await prisma.payment.create({
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
        await prisma.redeemedCoupon.upsert({
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
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).send("error");
  }
};
