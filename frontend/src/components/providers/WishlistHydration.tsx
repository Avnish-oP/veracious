"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";

export default function WishlistHydration() {
  const { user } = useUserStore();
  const { fetchWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    if (user) {
      // Fetch wishlist when user is logged in
      fetchWishlist();
    } else {
      // Clear wishlist when user logs out
      clearWishlist();
    }
  }, [user, fetchWishlist, clearWishlist]);

  return null;
}
