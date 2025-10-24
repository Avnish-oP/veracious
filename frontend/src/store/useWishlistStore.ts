import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WishlistItem } from "@/types/wishlistTypes";
import { fetchWishlist, toggleWishlistItem } from "@/utils/wishlistApi";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // Fetch wishlist from API
      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchWishlist();
          set({ items: data.items, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching wishlist:", error);
          set({
            error: error.response?.data?.message || "Failed to fetch wishlist",
            isLoading: false,
          });
        }
      },

      // Toggle item in wishlist
      toggleItem: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          await toggleWishlistItem(productId);

          // Optimistically update local state
          const currentItems = get().items;
          const itemIndex = currentItems.findIndex(
            (item) => item.productId === productId
          );

          if (itemIndex > -1) {
            // Remove from wishlist
            set({
              items: currentItems.filter(
                (item) => item.productId !== productId
              ),
              isLoading: false,
            });
          } else {
            // Refetch to get the complete item data with product details
            await get().fetchWishlist();
          }
        } catch (error: any) {
          console.error("Error toggling wishlist item:", error);
          set({
            error: error.response?.data?.message || "Failed to update wishlist",
            isLoading: false,
          });
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      // Get total wishlist count
      getWishlistCount: () => {
        return get().items.length;
      },

      // Clear wishlist (for logout)
      clearWishlist: () => {
        set({ items: [], error: null, isLoading: false });
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
