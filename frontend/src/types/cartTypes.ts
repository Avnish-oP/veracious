// Cart related types for the application

import { Product } from "./productTypes";

export interface CartItem {
  id?: string; // DB cart item ID (only for logged-in users)
  productId: string;
  quantity: number;
  product?: Product; // Populated product details
}

export interface Cart {
  id?: string; // DB cart ID (only for logged-in users)
  userId?: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface CartResponse {
  success: boolean;
  message?: string;
  cart: Cart;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

export interface RemoveCartItemRequest {
  productId: string;
}

export interface MergeCartsRequest {
  guestCart: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  };
}

// Local storage cart structure (for guest users)
export interface LocalStorageCart {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

// Cart summary for display
export interface CartSummary {
  totalItems: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
}

// Cart store state
export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;

  // Actions
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<void>;
  clearCart: () => void;
  mergeGuestCart: () => Promise<void>;

  // Computed
  getCartSummary: () => CartSummary;
  getItemQuantity: (productId: string) => number;
}
