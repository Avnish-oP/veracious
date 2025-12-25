"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/productTypes";

const STORAGE_KEY = "veracious_recently_viewed";
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recently viewed items", e);
      }
    }
  }, []);

  const addToRecentlyViewed = useCallback((product: Product) => {
    // Read directly from storage to insure we have the latest data
    // irrespective of the current react state (prevents race conditions on mount)
    let currentItems: Product[] = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        currentItems = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse recently viewed for update", e);
      }
    }

    // Remove existing occurrence of this product
    const filtered = currentItems.filter((p) => p.id !== product.id);
    
    // Add to top
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    
    // Save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Update state
    setRecentlyViewed(updated);
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
};
