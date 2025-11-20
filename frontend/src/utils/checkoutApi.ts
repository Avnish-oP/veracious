// Checkout and payment API utilities

import {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyOrderRequest,
  VerifyOrderResponse,
} from "@/types/orderTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Create a new order and get Razorpay order details
 */
export const createOrder = async (
  data: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create order");
  }

  return result;
};

/**
 * Verify payment after Razorpay payment is completed
 */
export const verifyPayment = async (
  data: VerifyOrderRequest
): Promise<VerifyOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/checkout/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Payment verification failed");
  }

  return result;
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
