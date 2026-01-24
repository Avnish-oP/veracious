// Zustand store for cart management (both guest and logged-in users)

import { create } from "zustand";
import { Cart, CartSummary, ItemConfiguration } from "@/types/cartTypes";
import { ApplyCouponResponse, Coupons } from "@/types/couponsTypes";
import { applyCouponCodeApi } from "@/utils/couponsApi";
import {
  getGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartItem,
  clearGuestCart,
} from "@/utils/guestCart";
import { fetchMultipleProductDetails } from "@/utils/productDetailsApi";
import { calculateCartSummary, calculateDiscountedSubtotal } from "@/utils/cartUtils";
// Removed useUserStore and API imports as this store will now strictly handle Guest State
// API State for logged-in users is handled by useCart (TanStack Query)

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  appliedCoupon: Coupons | null;
  couponDiscount: number;
  couponApplying: boolean;

  // Actions
  addToCart: (productId: string, quantity: number, configuration?: ItemConfiguration) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>; // actually initializeGuestCart
  clearCart: () => void;
  // mergeGuestCart removed - handled by useCart hook
  initializeCart: () => Promise<void>;
  applyCouponToCart: (
    code: string,
    options?: { silent?: boolean }
  ) => Promise<ApplyCouponResponse>;
  removeCoupon: () => void;

  // Computed
  getCartSummary: () => CartSummary;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => {
  const reapplyCouponIfNeeded = async () => {
    const currentCoupon = get().appliedCoupon;
    if (!currentCoupon) {
      return;
    }

    try {
      await get().applyCouponToCart(currentCoupon.code, { silent: true });
    } catch (error) {
      console.warn("Coupon validation failed for current cart", error);
      set({ appliedCoupon: null, couponDiscount: 0 });
    }
  };

  // Use shared utility for discounted subtotal calculation
  const getDiscountedSubtotal = () => {
    const { cart } = get();
    return calculateDiscountedSubtotal(cart);
  };

  return {
    cart: null,
    loading: false,
    error: null,
    appliedCoupon: null,
    couponDiscount: 0,
    couponApplying: false,

    /**
     * Initialize cart - load from localStorage (guest) or fetch from backend (logged-in)
     */
    initializeCart: async () => {
      // Guest user: load from localStorage and fetch product details
      const guestCart = getGuestCart();

      if (guestCart.items.length > 0) {
        set({ loading: true });

        // Fetch product details for all items
        const productIds = guestCart.items.map((item) => item.productId);
        const productDetails = await fetchMultipleProductDetails(productIds);

        // Populate cart items with product details
        const itemsWithDetails = guestCart.items.map((item) => ({
          ...item,
          product: productDetails[item.productId] || {
            id: item.productId,
            name: "Product",
            price: 0,
            brand: "",
            image: null,
          },
        }));

        set({
          cart: {
            items: itemsWithDetails,
          },
          loading: false,
        });
      } else {
        set({
          cart: {
            items: [],
          },
        });
      }
    },

    /**
     * Add item to cart
     */
    addToCart: async (productId: string, quantity: number, configuration?: ItemConfiguration) => {
      set({ loading: true, error: null });

      try {
        // Guest user: save to localStorage and fetch product details
        const guestCart = addToGuestCart(productId, quantity, configuration);

        // Fetch product details for all items
        const productIds = guestCart.items.map((item) => item.productId);
        const productDetails = await fetchMultipleProductDetails(productIds);

        // Populate cart items with product details
        const itemsWithDetails = guestCart.items.map((item) => ({
          ...item,
          product: productDetails[item.productId] || {
            id: item.productId,
            name: "Product",
            price: 0,
            brand: "",
            image: null,
          },
        }));

        set({
          cart: {
            items: itemsWithDetails,
          },
          loading: false,
        });

        await reapplyCouponIfNeeded();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to add item to cart",
          loading: false,
        });
        throw error;
      }
    },

    /**
     * Remove item from cart
     */
    removeFromCart: async (productId: string) => {
      set({ loading: true, error: null });

      try {
        // Guest user: update localStorage and refresh product details
        const guestCart = removeFromGuestCart(productId);

        if (guestCart.items.length > 0) {
          // Fetch product details for remaining items
          const productIds = guestCart.items.map((item) => item.productId);
          const productDetails = await fetchMultipleProductDetails(productIds);

          // Populate cart items with product details
          const itemsWithDetails = guestCart.items.map((item) => ({
            ...item,
            product: productDetails[item.productId] || {
              id: item.productId,
              name: "Product",
              price: 0,
              brand: "",
              image: null,
            },
          }));

          set({
            cart: {
              items: itemsWithDetails,
            },
            loading: false,
          });
        } else {
          set({
            cart: {
              items: [],
            },
            loading: false,
          });
        }

        await reapplyCouponIfNeeded();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to remove item from cart",
          loading: false,
        });
        throw error;
      }
    },

    /**
     * Update item quantity in cart
     */
    updateCartItem: async (productId: string, quantity: number) => {
      set({ loading: true, error: null });

      try {
        // Guest user: update localStorage and refresh product details
        const guestCart = updateGuestCartItem(productId, quantity);

        if (guestCart.items.length > 0) {
          // Fetch product details for all items
          const productIds = guestCart.items.map((item) => item.productId);
          const productDetails = await fetchMultipleProductDetails(productIds);

          // Populate cart items with product details
          const itemsWithDetails = guestCart.items.map((item) => ({
            ...item,
            product: productDetails[item.productId] || {
              id: item.productId,
              name: "Product",
              price: 0,
              brand: "",
              image: null,
            },
          }));

          set({
            cart: {
              items: itemsWithDetails,
            },
            loading: false,
          });
        } else {
          set({
            cart: {
              items: [],
            },
            loading: false,
          });
        }

        await reapplyCouponIfNeeded();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to update cart item",
          loading: false,
        });
        throw error;
      }
    },

    /**
     * Fetch cart (alias for initialize, kept for compatibility)
     */

    // Fetch Cart is also redundant but kept for interface compatibility (will just init)
    fetchCart: async () => {
      await get().initializeCart();
    },

    clearCart: () => {
      // Guest user: clear localStorage
      clearGuestCart();
      set({
        cart: { items: [] },
        error: null,
        appliedCoupon: null,
        couponDiscount: 0,
        couponApplying: false,
      });
    },

    applyCouponToCart: async (
      code: string,
      options?: { silent?: boolean }
    ): Promise<ApplyCouponResponse> => {
      const { cart } = get();
      const silent = Boolean(options?.silent);

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error("Add items to your cart before applying a coupon");
      }

      const formattedCode = code.trim().toUpperCase();
      if (!formattedCode) {
        throw new Error("Coupon code is required");
      }

      const orderValue = getDiscountedSubtotal();

      const productIds = cart.items.map((item) => item.productId);

      if (!silent) {
        set({ couponApplying: true, error: null });
      }

      try {
        const response = await applyCouponCodeApi({
          code: formattedCode,
          orderValue,
          productIds,
        });

        set({
          appliedCoupon: response.coupon,
          couponDiscount: Number(response.discountAmount) || 0,
          couponApplying: false,
        });

        return response;
      } catch (error) {
        if (!silent) {
          set({
            couponApplying: false,
            error: error instanceof Error ? error.message : "Failed to apply coupon",
          });
        }
        throw error;
      }
    },

    removeCoupon: () => {
      set({ appliedCoupon: null, couponDiscount: 0, couponApplying: false });
    },

    /**
     * Get cart summary (subtotal, total items, etc.)
     */
    getCartSummary: (): CartSummary => {
      const { cart, couponDiscount } = get();
      return calculateCartSummary(cart, couponDiscount);
    },

    /**
     * Get quantity of specific item in cart
     */
    getItemQuantity: (productId: string): number => {
      const { cart } = get();

      if (!cart || !cart.items) {
        return 0;
      }

      const item = cart.items.find((item) => item.productId === productId);
      return item?.quantity || 0;
    },

    /**
     * Get total number of items in cart
     */
    getTotalItems: (): number => {
      const { cart } = get();

      if (!cart || !cart.items) {
        return 0;
      }

      return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  };
});
