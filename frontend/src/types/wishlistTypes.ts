import { Product } from "./productTypes";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
}

export interface ToggleWishlistResponse {
  message: string;
  wishlist: Array<{ productId: string }>;
}
