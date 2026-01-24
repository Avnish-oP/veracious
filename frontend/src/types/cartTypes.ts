// Cart related types for the application

import { Product } from "./productTypes";
import { ApplyCouponResponse, Coupons } from "./couponsTypes";

// Item configuration for lens or contact lens customization
export interface ItemConfiguration {
  lensPrice?: number;
  lensType?: string;
  prescriptionType?: string;
  power?: string;
  cylinder?: string;
  axis?: string;
  type?: string;
  coating?: string;
  lensPriceId?: string;
}

export interface CartItem {
  id?: string; // DB cart item ID (only for logged-in users)
  productId: string;
  quantity: number;
  configuration?: ItemConfiguration;
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
  configuration?: ItemConfiguration;
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
      configuration?: ItemConfiguration;
    }>;
  };
}

// Local storage cart structure (for guest users)
export interface LocalStorageCart {
  items: Array<{
    productId: string;
    quantity: number;
    configuration?: ItemConfiguration;
  }>;
}

// Cart summary for display
export interface CartSummary {
  totalItems: number;
  subtotal: number;
  subtotalAfterDiscount: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  couponDiscount: number;
  total: number;
}

// Cart store state
export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  appliedCoupon: Coupons | null;
  couponDiscount: number;
  couponApplying: boolean;

  // Actions
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<void>;
  clearCart: () => void;
  mergeGuestCart: () => Promise<void>;
  applyCouponToCart: (
    code: string,
    options?: { silent?: boolean }
  ) => Promise<ApplyCouponResponse>;
  removeCoupon: () => void;

  // Computed
  getCartSummary: () => CartSummary;
  getItemQuantity: (productId: string) => number;
}
