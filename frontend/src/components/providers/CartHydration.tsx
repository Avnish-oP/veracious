"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUser } from "@/hooks/useUser";

/**
 * CartHydration component
 * Initializes guest cart on app mount - only when user is not logged in
 */
export default function CartHydration() {
  const { initializeCart } = useCartStore();
  const { user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    // Only initialize guest cart if user is not logged in
    // Wait for user loading to complete first
    if (!isUserLoading && !user) {
      initializeCart();
    }
  }, [initializeCart, user, isUserLoading]);

  return null;
}
