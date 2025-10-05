"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";

/**
 * CartHydration component
 * Initializes cart on app mount - loads from localStorage (guest) or backend (logged-in)
 */
export default function CartHydration() {
  const { initializeCart } = useCartStore();
  const { user, loading } = useUserStore();

  useEffect(() => {
    // Wait for user loading to complete before initializing cart
    if (!loading) {
      initializeCart();
    }
  }, [user, loading, initializeCart]);

  return null;
}
