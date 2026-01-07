import {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  MergeCartsRequest,
} from "@/types/cartTypes";

import api from "../lib/axios";
import { ApiCallConfig } from "./api";
import { AxiosError } from "axios";

/**
 * Generic API call function with proper error handling
 */
async function cartApiCall<T>(
  endpoint: string,
  options: ApiCallConfig = {}
): Promise<T> {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      ...options
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((err.response?.data as any)?.message || "An error occurred");
  }
}

export const addToCartAPI = async (
  productId: string,
  quantity: number,
  configuration?: any
): Promise<CartResponse> => {
  return cartApiCall<CartResponse>("/cart/add", {
    method: "POST",
    body: JSON.stringify({ productId, quantity, configuration } as AddToCartRequest),
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
