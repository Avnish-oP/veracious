import razorpay from "../lib/razorpay";
import crypto from "crypto";

export const createRazorpayOrder = async (
  amount: number,
  currency: string,
  receipt: string
) => {
  const options = {
    amount: Math.round(amount * 100), // Amount in smallest currency unit (must be integer)
    currency,
    receipt,
  };
  const order = await razorpay.orders.create(options);
  return order;
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};
