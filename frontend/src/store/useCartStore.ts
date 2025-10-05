// Zustand store for cart management (both guest and logged-in users)

import { create } from "zustand";
import { Cart, CartItem, CartSummary } from "@/types/cartTypes";
import {
  addToCartAPI,
  getCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  mergeCartsAPI,
} from "@/utils/cartApi";
import {
  getGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartItem,
  clearGuestCart,
  hasGuestCartItems,
} from "@/utils/guestCart";
import { fetchMultipleProductDetails } from "@/utils/productDetailsApi";
import { useUserStore } from "./useUserStore";

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  error: string | null;

  // Actions
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
  mergeGuestCart: () => Promise<void>;
  initializeCart: () => Promise<void>;

  // Computed
  getCartSummary: () => CartSummary;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  /**
   * Initialize cart - load from localStorage (guest) or fetch from backend (logged-in)
   */
  initializeCart: async () => {
    const { user } = useUserStore.getState();

    if (user) {
      // Logged-in user: fetch from backend
      await get().fetchCart();
    } else {
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
    }
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId: string, quantity: number) => {
    const { user } = useUserStore.getState();
    set({ loading: true, error: null });

    try {
      if (user) {
        // Logged-in user: call backend API
        const response = await addToCartAPI(productId, quantity);
        set({ cart: response.cart, loading: false });
      } else {
        // Guest user: save to localStorage and fetch product details
        const guestCart = addToGuestCart(productId, quantity);

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
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to add item to cart",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (productId: string) => {
    const { user } = useUserStore.getState();
    set({ loading: true, error: null });

    try {
      if (user) {
        // Logged-in user: call backend API
        const response = await removeFromCartAPI(productId);
        set({ cart: response.cart, loading: false });
      } else {
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
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove item from cart",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Update item quantity in cart
   */
  updateCartItem: async (productId: string, quantity: number) => {
    const { user } = useUserStore.getState();
    set({ loading: true, error: null });

    try {
      if (user) {
        // Logged-in user: call backend API
        const response = await updateCartItemAPI(productId, quantity);
        set({ cart: response.cart, loading: false });
      } else {
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
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to update cart item",
        loading: false,
      });
      throw error;
    }
  },

  /**
   * Fetch cart from backend (logged-in users only)
   */
  fetchCart: async () => {
    const { user } = useUserStore.getState();

    if (!user) {
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
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await getCartAPI();
      set({ cart: response.cart, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch cart",
        loading: false,
      });
    }
  },

  /**
   * Clear cart
   */
  clearCart: () => {
    const { user } = useUserStore.getState();

    if (!user) {
      // Guest user: clear localStorage
      clearGuestCart();
    }

    set({ cart: { items: [] }, error: null });
  },

  /**
   * Merge guest cart with logged-in user cart
   * Called after user logs in
   */
  mergeGuestCart: async () => {
    const { user } = useUserStore.getState();

    if (!user) {
      console.warn("Cannot merge cart: user not logged in");
      return;
    }

    // Check if guest cart has items
    if (!hasGuestCartItems()) {
      // No guest cart items, just fetch user cart
      await get().fetchCart();
      return;
    }

    set({ loading: true, error: null });

    try {
      // Get guest cart from localStorage
      const guestCart = getGuestCart();

      // Call merge API
      const response = await mergeCartsAPI(guestCart);

      // Update cart state
      set({ cart: response.cart, loading: false });

      // Clear localStorage cart
      clearGuestCart();
    } catch (error: any) {
      set({
        error: error.message || "Failed to merge carts",
        loading: false,
      });
      console.error("Cart merge error:", error);
    }
  },

  /**
   * Get cart summary (subtotal, total items, etc.)
   */
  getCartSummary: (): CartSummary => {
    const { cart } = get();

    if (!cart || !cart.items) {
      return {
        totalItems: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      };
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate subtotal using original prices
    const subtotal = cart.items.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    // Calculate discount (difference between original price and discount price)
    const discount = cart.items.reduce((sum, item) => {
      if (item.product?.discountPrice && item.product?.price) {
        const savings =
          (Number(item.product.price) - Number(item.product.discountPrice)) *
          item.quantity;
        return sum + savings;
      }
      return sum;
    }, 0);

    // Calculate actual amount after discount
    const subtotalAfterDiscount = cart.items.reduce((sum, item) => {
      const price =
        Number(item.product?.discountPrice) || Number(item.product?.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    // Shipping: Free if subtotal is over $50, otherwise $5
    const shipping =
      subtotalAfterDiscount >= 50 ? 0 : subtotalAfterDiscount > 0 ? 5 : 0;

    // Tax: 8% of subtotal after discount
    const tax = subtotalAfterDiscount * 0.08;

    const total = subtotalAfterDiscount + shipping + tax;

    return {
      totalItems,
      subtotal,
      discount,
      tax,
      shipping,
      total,
    };
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
}));
