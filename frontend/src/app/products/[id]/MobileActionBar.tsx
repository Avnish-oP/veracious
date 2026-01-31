"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, Loader2 } from "lucide-react";
import { Product } from "@/types/productTypes";
import { cn } from "@/utils/cn";

interface MobileActionBarProps {
  product: Product;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  isLoading?: boolean;
  showThreshold?: number; // pixels scrolled before showing
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  isLoading = false,
  showThreshold = 600,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showThreshold]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await onAddToCart();
    } finally {
      setIsAddingToCart(false);
    }
  };

  const effectivePrice = product.discountPrice ?? product.price;
  const savings = product.discountPrice
    ? Number(product.price) - Number(product.discountPrice)
    : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          {/* Backdrop Blur Container */}
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl">
            {/* Safe area padding for iOS */}
            <div className="px-4 py-3 pb-[env(safe-area-inset-bottom,12px)]">
              {/* Price Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{Number(effectivePrice).toFixed(0)}
                  </span>
                  {savings > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{Number(product.price).toFixed(0)}
                      </span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        Save ₹{savings.toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full",
                    product.stock > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isLoading || isAddingToCart}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
                    "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  Add to Cart
                </button>
                <button
                  onClick={onBuyNow}
                  disabled={product.stock === 0 || isLoading}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]",
                    "bg-gray-900 hover:bg-black text-white shadow-lg",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
