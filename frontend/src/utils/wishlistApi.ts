import axios from "axios";
import {
  WishlistResponse,
  ToggleWishlistResponse,
} from "@/types/wishlistTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance with credentials
const wishlistApi = axios.create({
  baseURL: `${API_BASE_URL}/wishlist`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get user's wishlist
export const fetchWishlist = async (): Promise<WishlistResponse> => {
  const response = await wishlistApi.get("/");
  return response.data;
};

// Toggle product in wishlist (add if not present, remove if present)
export const toggleWishlistItem = async (
  productId: string
): Promise<ToggleWishlistResponse> => {
  const response = await wishlistApi.post(`/toggle/${productId}`);
  return response.data;
};

// Check if a product is in wishlist (based on local state)
export const isProductInWishlist = (
  productId: string,
  wishlistItems: Array<{ productId: string }>
): boolean => {
  return wishlistItems.some((item) => item.productId === productId);
};
