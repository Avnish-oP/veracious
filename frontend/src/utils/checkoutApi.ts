// Checkout and payment API utilities

import api from "../lib/axios";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyOrderRequest,
  VerifyOrderResponse,
} from "@/types/orderTypes";

/**
 * Create a new order and get Razorpay order details
 */
export const createOrder = async (
  data: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const response = await api.post("/checkout/create", data);
  return response.data;
};

/**
 * Verify payment after Razorpay payment is completed
 */
export const verifyPayment = async (
  data: VerifyOrderRequest
): Promise<VerifyOrderResponse> => {
  const response = await api.post("/checkout/verify", data);
  return response.data;
};

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
