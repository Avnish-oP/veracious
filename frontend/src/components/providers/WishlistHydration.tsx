"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistHydration() {
  const { user } = useUserStore();
  const { clearWishlist } = useWishlist();

  useEffect(() => {
    if (!user) {
        clearWishlist();
    }
  }, [user, clearWishlist]);

  return null;
}
