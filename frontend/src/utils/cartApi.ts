// Cart API service for backend communication

import {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  MergeCartsRequest,
} from "@/types/cartTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Generic API call function with proper error handling
 */
async function cartApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for authentication
    ...options,
  });
  console.log("Response:", response);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
}

/**
 * Add item to cart (logged-in user)
 */
export const addToCartAPI = async (
  productId: string,
  quantity: number
): Promise<CartResponse> => {
  return cartApiCall<CartResponse>("/cart/add", {
    method: "POST",
    body: JSON.stringify({ productId, quantity } as AddToCartRequest),
  });
};

/**
 * Get cart (logged-in user)
 */
export const getCartAPI = async (): Promise<CartResponse> => {
  return cartApiCall<CartResponse>("/cart");
};

/**
 * Update cart item quantity (logged-in user)
 */
export const updateCartItemAPI = async (
  productId: string,
  quantity: number
): Promise<CartResponse> => {
  return cartApiCall<CartResponse>(`/cart/update/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ productId, quantity } as UpdateCartItemRequest),
  });
};

/**
 * Remove item from cart (logged-in user)
 */
export const removeFromCartAPI = async (
  productId: string
): Promise<CartResponse> => {
  return cartApiCall<CartResponse>(`/cart/remove/${productId}`, {
    method: "DELETE",
    body: JSON.stringify({ productId } as RemoveCartItemRequest),
  });
};

/**
 * Merge guest cart with logged-in user cart
 */
export const mergeCartsAPI = async (guestCart: {
  items: Array<{ productId: string; quantity: number }>;
}): Promise<CartResponse> => {
  return cartApiCall<CartResponse>("/cart/merge", {
    method: "POST",
    body: JSON.stringify({ guestCart } as MergeCartsRequest),
  });
};
