"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useSimilarProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types/productTypes";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/utils/cn";

interface ProductRecommendationsProps {
  productId: string;
  title?: string;
  className?: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  productId,
  title = "You May Also Like",
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useSimilarProducts({ productId, limit: 8 });
  const { addToCart } = useCart();

  const products = data?.products || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id, 1);
  };

  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] h-[360px] bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn("py-10", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">Based on this product</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative -mx-4 px-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
          style={{
            scrollPaddingLeft: "16px",
            scrollPaddingRight: "16px",
          }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                size="md"
              />
            </motion.div>
          ))}
        </div>

        {/* Gradient Fade Edges (Desktop) */}
        <div className="hidden md:block absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[#FAFAFA] to-transparent pointer-events-none z-10" />
      </div>

      {/* Mobile Scroll Hint */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex gap-1">
          {products.slice(0, Math.min(products.length, 5)).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-300"
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};
