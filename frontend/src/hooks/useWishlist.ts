import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlist, toggleWishlistItem } from "@/utils/wishlistApi";
import { WishlistItem } from "@/types/wishlistTypes";
import toast from "react-hot-toast";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export function useWishlist() {
  const queryClient = useQueryClient();

  // Fetch Wishlist Query
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle Wishlist Item Mutation
  const toggleMutation = useMutation({
    mutationFn: (productId: string) => toggleWishlistItem(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      // Optimistically update to the new value
      const isCurrentlyInWishlist = previousWishlist.some(item => item.productId === productId);
      
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return [];
        if (isCurrentlyInWishlist) {
            // Remove
            return old.filter(item => item.productId !== productId);
        } else {
             // Add (Mocking the item structure temporarily)
             // In a real app, we might need more product data here for the UI to be perfect instantly
             // but for simpler UIs (like just a heart icon), this is enough.
             // If we need full product data, we'd need to pass it to the mutation.
             // For now, we'll just keep the filtered list if removing, 
             // or wait for refetch if adding (or we could pass product object to optimistic update if needed)
             return old; 
        }
      });

      return { previousWishlist };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      toast.error("Failed to update wishlist");
    },
    onSuccess: (data, productId) => {
        // Invalidate to refetch the true state (especially to get full product details after adding)
        queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
        
        // We can check if it was added or removed based on the response or previous state, 
        // effectively handled by the UI reacting to the new data.
        // Or we could show a toast here.
    },
  });

  const toggleWishlist = (productId: string) => {
    toggleMutation.mutate(productId);
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, []);
  }

  return {
    items,
    isLoading,
    isError,
    error,
    toggleWishlist,
    isToggling: toggleMutation.isPending,
    isInWishlist,
    count: items.length,
    clearWishlist
  };
}
