import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, USER_QUERY_KEY } from "./useUser";
import { useCartStore } from "@/store/useCartStore";
import {
  getCartAPI,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  mergeCartsAPI,
} from "@/utils/cartApi";
import { ExtendedApiError } from "@/utils/api";
import {
  getGuestCart,
  clearGuestCart as clearGuestCartStorage,
} from "@/utils/guestCart";
import { Cart } from "@/types/cartTypes";
import { toast } from "react-hot-toast";
import { CartSummary } from "@/types/cartTypes";
import { User } from "@/types/userTypes";

export const CART_QUERY_KEY = ["cart"];

// Helper to get current user from query cache (always fresh)
const getCurrentUser = (
  queryClient: ReturnType<typeof useQueryClient>
): User | null => {
  return queryClient.getQueryData<User | null>(USER_QUERY_KEY) ?? null;
};

export function useCart() {
  const { user, isLoading: isUserLoading } = useUser();
  const queryClient = useQueryClient();

  // Guest Store Logic
  const guestCart = useCartStore((state) => state.cart);
  const guestLoading = useCartStore((state) => state.loading);
  const addToGuestCart = useCartStore((state) => state.addToCart);
  const removeFromGuestCart = useCartStore((state) => state.removeFromCart);
  const updateGuestCartItem = useCartStore((state) => state.updateCartItem);
  const initializeGuestCart = useCartStore((state) => state.initializeCart);
  const clearGuestCartStore = useCartStore((state) => state.clearCart);

  // Coupon State (Client-side for now, synced via store)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const couponDiscount = useCartStore((state) => state.couponDiscount);
  const couponApplying = useCartStore((state) => state.couponApplying);
  const applyCouponToStore = useCartStore((state) => state.applyCouponToCart);
  const removeCouponFromStore = useCartStore((state) => state.removeCoupon);

  // --- QUERIES ---

  // Fetch Server Cart (only if user is logged in)
  const {
    data: serverCart,
    isLoading: isServerLoading,
    isError,
    error,
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const response = await getCartAPI();
      return response.cart;
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Determine active cart - wait for user loading to complete first
  const cart: Cart | null = isUserLoading
    ? null
    : user
    ? serverCart ?? null
    : guestCart;
  const isLoading = isUserLoading || (user ? isServerLoading : guestLoading);

  // --- MUTATIONS ---

  // Add Item
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      configuration,
    }: {
      productId: string;
      quantity: number;
      configuration?: any;
    }) => {
      // Get fresh user from query cache at mutation time
      const currentUser = getCurrentUser(queryClient);

      if (currentUser) {
        return {
          ...(await addToCartAPI(productId, quantity, configuration)),
          isServerCart: true,
        };
      } else {
        await addToGuestCart(productId, quantity, configuration);
        const cartState = useCartStore.getState().cart;
        return { cart: cartState, isServerCart: false };
      }
    },
    onSuccess: (data) => {
      if (data.isServerCart) {
        queryClient.setQueryData(CART_QUERY_KEY, data.cart);
        
        // Re-validate coupon if applied
        const appliedCoupon = useCartStore.getState().appliedCoupon;
        if (appliedCoupon) {
          applyCoupon(appliedCoupon.code, { silent: true, cartData: data.cart }).catch(() => {
             // If validation fails (e.g. min spend not met), remove coupon
             useCartStore.getState().removeCoupon();
          });
        }
      }
      toast.success("Added to cart");
    },
    onError: (err: ExtendedApiError) => {
      toast.error(err.message || "Failed to add to cart");
    },
  });

  // Remove Item
  const removeFromCartMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const currentUser = getCurrentUser(queryClient);

      if (currentUser) {
        return { ...(await removeFromCartAPI(productId)), isServerCart: true };
      } else {
        await removeFromGuestCart(productId);
        return { cart: useCartStore.getState().cart, isServerCart: false };
      }
    },
    onSuccess: (data) => {
      if (data.isServerCart) {
        queryClient.setQueryData(CART_QUERY_KEY, data.cart);

        // Re-validate coupon if applied
        const appliedCoupon = useCartStore.getState().appliedCoupon;
        if (appliedCoupon) {
          applyCoupon(appliedCoupon.code, { silent: true, cartData: data.cart }).catch(() => {
             useCartStore.getState().removeCoupon();
          });
        }
      }
      toast.success("Removed from cart");
    },
    onError: (err: ExtendedApiError) => {
      toast.error(err.message || "Failed to remove from cart");
    },
  });

  // Update Item
  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const currentUser = getCurrentUser(queryClient);

      if (currentUser) {
        return {
          ...(await updateCartItemAPI(productId, quantity)),
          isServerCart: true,
        };
      } else {
        await updateGuestCartItem(productId, quantity);
        return { cart: useCartStore.getState().cart, isServerCart: false };
      }
    },
    onSuccess: (data) => {
      if (data.isServerCart) {
        queryClient.setQueryData(CART_QUERY_KEY, data.cart);

        // Re-validate coupon if applied
        const appliedCoupon = useCartStore.getState().appliedCoupon;
        if (appliedCoupon) {
          applyCoupon(appliedCoupon.code, { silent: true, cartData: data.cart }).catch(() => {
             useCartStore.getState().removeCoupon();
          });
        }
      }
    },
    onError: (err: ExtendedApiError) => {
      toast.error(err.message || "Failed to update cart");
    },
  });

  // Merge Guest Cart (Explicit Action)
  const mergeGuestCartMutation = useMutation({
    mutationFn: async () => {
      const guestItems = getGuestCart().items;
      if (guestItems.length === 0) return null;

      const response = await mergeCartsAPI({ items: guestItems });
      return response.cart;
    },
    onSuccess: (mergedCart) => {
      if (mergedCart) {
        queryClient.setQueryData(CART_QUERY_KEY, mergedCart);
        clearGuestCartStorage();
        clearGuestCartStore();
        toast.success("Cart merged successfully");
      }
    },
  });

  // --- HELPERS ---

  const getItemQuantity = (productId: string) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const getTotalItems = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartSummary = (): CartSummary => {
    if (!cart || !cart.items) {
      return {
        totalItems: 0,
        subtotal: 0,
        subtotalAfterDiscount: 0,
        discount: 0,
        couponDiscount: 0,
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

    const normalizedCouponDiscount = Math.min(
      couponDiscount || 0,
      subtotalAfterDiscount
    );

    const total = Math.max(0, subtotalAfterDiscount - normalizedCouponDiscount);

    return {
      totalItems,
      subtotal,
      discount,
      subtotalAfterDiscount,
      couponDiscount: normalizedCouponDiscount,
      total,
    };
  };

  // Safe Actions (wrappers)
  const addToCart = (productId: string, quantity: number, configuration?: any) =>
    addToCartMutation.mutateAsync({ productId, quantity, configuration });

  const removeFromCart = (productId: string) =>
    removeFromCartMutation.mutateAsync({ productId });

  const updateCartItem = (productId: string, quantity: number) =>
    updateCartItemMutation.mutateAsync({ productId, quantity });

  const mergeGuestCart = () => mergeGuestCartMutation.mutateAsync();

  const applyCoupon = async (code: string, options?: { silent?: boolean, cartData?: Cart | null }) => {
    // If logged in, use provided cart data or hook state cart
    const cartToUse = options?.cartData || cart;
    const silent = options?.silent;

    if (user && cartToUse && cartToUse.items.length > 0) {
      if (!silent) {
        useCartStore.setState({ couponApplying: true, error: null });
      }
      
      try {
        const orderValue =
        cartToUse.items.reduce((sum, item) => {
            const price =
              Number(item.product?.discountPrice) ||
              Number(item.product?.price) ||
              0;
            return sum + price * item.quantity;
          }, 0);

        const productIds = cartToUse.items.map((item) => item.productId);

        const { applyCouponCodeApi } = await import("@/utils/couponsApi");
        
        const response = await applyCouponCodeApi({
          code,
          orderValue,
          productIds,
        });

        useCartStore.setState({
          appliedCoupon: response.coupon,
          couponDiscount: Number(response.discountAmount) || 0,
          couponApplying: false,
        });

        return response;
      } catch (error) {
        if (!silent) {
          useCartStore.setState({
            couponApplying: false,
            error: error instanceof Error ? error.message : "Failed to apply coupon",
          });
        }
        throw error;
      }
    } 
    
    // Fallback to store logic
    return applyCouponToStore(code, options);
  };
  const removeCoupon = () => removeCouponFromStore();

  return {
    cart,
    isLoading,
    isUserLoading,
    isError,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    mergeGuestCart,
    getItemQuantity,
    getTotalItems,
    initializeGuestCart,
    // Coupon & Summary
    appliedCoupon,
    couponDiscount,
    couponApplying,
    applyCoupon,
    removeCoupon,
    getCartSummary,
    clearCart: () => {
      // Clear Guest
      clearGuestCartStorage();
      clearGuestCartStore();

      // Clear Server State (Optimistic)
      if (user) {
        queryClient.setQueryData(CART_QUERY_KEY, { items: [] });
        // Ideally also invalidate to re-fetch fresh empty state from server
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
    },
  };
}
