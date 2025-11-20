import { Request, Response } from "express";
import prisma from "../../utils/prisma";
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

    const orderRecord = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        finalAmount: true,
        couponId: true,
        userId: true,
      },
    });

    if (!orderRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // update order + payment record
    await prisma.payment.create({
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

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING" as any,
        updatedAt: new Date(),
      },
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

    return res.json({ success: true });
  } catch (err) {
    console.error("verifyOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
};
