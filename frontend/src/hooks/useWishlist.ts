import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlist, toggleWishlistItem } from "@/utils/wishlistApi";
import { WishlistItem } from "@/types/wishlistTypes";
import { useUser } from "./useUser";
import toast from "react-hot-toast";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export function useWishlist() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Fetch Wishlist Query - only when user is logged in
  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const data = await fetchWishlist();
      return data.items;
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle Wishlist Item Mutation
  const toggleMutation = useMutation({
    mutationFn: (productId: string) => toggleWishlistItem(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      // Optimistically update
      const isCurrentlyInWishlist = previousWishlist.some(item => item.productId === productId);
      
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return [];
        if (isCurrentlyInWishlist) {
          // Remove from wishlist
          return old.filter(item => item.productId !== productId);
        } else {
          // Add to wishlist (optimistic placeholder)
          // Create a minimal placeholder that will be replaced on refetch
          const placeholderItem: WishlistItem = {
            id: `temp-${productId}`,
            userId: "pending",
            productId,
            createdAt: new Date().toISOString(),
            product: null, // Will be filled on refetch
          };
          return [...old, placeholderItem];
        }
      });

      return { previousWishlist, wasInWishlist: isCurrentlyInWishlist };
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      toast.error("Failed to update wishlist");
    },
    onSuccess: (_data, _productId, context) => {
      // Invalidate to refetch the true state with full product details
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      
      // Show appropriate toast
      if (context?.wasInWishlist) {
        toast.success("Removed from wishlist");
      } else {
        toast.success("Added to wishlist");
      }
    },
  });

  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    toggleMutation.mutate(productId);
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
    queryClient.setQueryData(WISHLIST_QUERY_KEY, []);
  };

  return {
    items,
    isLoading,
    isError,
    error,
    toggleWishlist,
    isToggling: toggleMutation.isPending,
    isInWishlist,
    count: items.length,
    clearWishlist,
  };
}
