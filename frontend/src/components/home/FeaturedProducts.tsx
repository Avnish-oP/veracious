"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types/productTypes";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import { QuickViewModal } from "@/components/products/QuickViewModal";

interface FeaturedProductsProps {
  allProducts: Product[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  loading?: boolean;
  error?: string;
  onViewAll?: (filter: string) => void;
}

const filterOptions = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "featured", label: "Featured", icon: Sparkles },
  { id: "top-rated", label: "Top Rated", icon: Star },
];

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  allProducts = [],
  featuredProducts = [],
  trendingProducts = [],
  loading = false,
  error,
  onViewAll,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(
    null
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // Get products based on active filter
  const getFilteredProducts = () => {
    switch (activeFilter) {
      case "featured":
        return featuredProducts;
      case "trending":
        return trendingProducts;
      case "all":
      default:
        return allProducts;
    }
  };

  const displayedProducts = getFilteredProducts();

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (_error) {
      toast.error("Failed to add item to cart");
    }
  };

  // Handle quick view
  const handleQuickView = (product: Product) => {
    setQuickViewProductId(product.id);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load products
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section
      id="featured-products"
      className="py-2 bg-gradient-to-b from-white to-gray-50"
    >
      {/* Quick View Modal */}
      {quickViewProductId && (
        <QuickViewModal
          isOpen={!!quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          productId={quickViewProductId}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Our{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Premium Selection
            </span>
          </h2>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.slice(0, 3).map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => setActiveFilter(option.id)}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    activeFilter === option.id
                      ? "bg-amber-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-gray-200"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                </motion.button>
              );
            })}
          </div>

          {/* Layout Toggle and View All */}
          <div className="flex items-center gap-3">
            {/* Layout Switcher */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setLayout("grid")}
                className={cn(
                  "p-2 rounded transition-all duration-200",
                  layout === "grid"
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout("list")}
                className={cn(
                  "p-2 rounded transition-all duration-200",
                  layout === "list"
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* View All Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAll?.(activeFilter)}
              className="hidden sm:flex"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-72 animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Display */}
        {!loading && displayedProducts.length > 0 && (
          <div className="relative">
            {layout === "grid" ? (
              <>
                {/* Left Arrow for Grid Horizontal Scroll */}
                <motion.button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-amber-50 transition-colors duration-200 hidden md:block"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>

                {/* Products Container - Horizontal Scroll */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {displayedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex-shrink-0 w-72"
                    >
                      <ProductCard
                        product={product}
                        onQuickView={handleQuickView}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={(p) => console.log("Wishlist:", p)}
                        size="md"
                        layout="vertical"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Right Arrow for Grid Horizontal Scroll */}
                <motion.button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-amber-50 transition-colors duration-200 hidden md:block"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              </>
            ) : (
              /* List Layout - Vertical Stack */
              <div className="space-y-4">
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={handleQuickView}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={(p) => console.log("Wishlist:", p)}
                      size="md"
                      layout="horizontal"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Products Message */}
        {!loading && displayedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No products found for this category.
            </p>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="primary"
            size="md"
            onClick={() => onViewAll?.(activeFilter)}
            className="w-full"
          >
            View All Products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
