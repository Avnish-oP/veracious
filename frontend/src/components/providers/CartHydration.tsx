"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

/**
 * CartHydration component
 * Initializes cart on app mount - loads from localStorage (guest) or backend (logged-in)
 */
export default function CartHydration() {
  const { initializeCart } = useCartStore();

  useEffect(() => {
     initializeCart();
  }, [initializeCart]);

  return null;
}
