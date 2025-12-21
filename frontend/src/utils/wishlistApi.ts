import api from "../lib/axios";
import {
  WishlistResponse,
  ToggleWishlistResponse,
} from "@/types/wishlistTypes";

// Create axios instance with credentials (using the centralized api as base if possible, or just using api directly)
// Since we want to use the interceptors from 'api', we should use 'api' directly and prepend '/wishlist'.
// Unlike 'axios.create', we can't easily extend 'api' with a new baseURL while keeping interceptors without cloning.
// So we will just use 'api' in the functions below.

// Get user's wishlist
export const fetchWishlist = async (): Promise<WishlistResponse> => {
  const response = await api.get("/wishlist");
  return response.data;
};

// Toggle product in wishlist (add if not present, remove if present)
export const toggleWishlistItem = async (
  productId: string
): Promise<ToggleWishlistResponse> => {
  const response = await api.post(`/wishlist/toggle/${productId}`);
  return response.data;
};

// Check if a product is in wishlist (based on local state)
export const isProductInWishlist = (
  productId: string,
  wishlistItems: Array<{ productId: string }>
): boolean => {
  return wishlistItems.some((item) => item.productId === productId);
};
