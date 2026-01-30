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

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (_error) {
      toast.error("Failed to add item to cart");
    }
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProductId(product.id);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
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
      className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50"
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
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Discover Our{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Premium Selection
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Curated styles that define elegance and performance.
          </p>
        </motion.div>

        {/* Controls Container */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          {/* Scrollable Filter Tabs */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {filterOptions.slice(0, 3).map((option) => {
                const Icon = option.icon;
                const isActive = activeFilter === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setActiveFilter(option.id)}
                    className={cn(
                      "flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-gray-900 text-white shadow-lg scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mr-2", isActive ? "text-amber-400" : "text-gray-400")} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Layout Toggle (Hidden on mobile usually, but kept for preference) */}
            <div className="hidden sm:flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setLayout("grid")}
                className={cn(
                  "p-2 rounded transition-all duration-200",
                  layout === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
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
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAll?.(activeFilter)}
              className="hidden md:flex group"
            >
              View More
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-72 animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Display */}
        {!loading && displayedProducts.length > 0 && (
          <div className="relative group/feature-slider">
            {layout === "grid" ? (
              <>
                 {/* Desktop Carousel Arrows */}
                <button
                  onClick={scrollLeft}
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl border border-gray-100 rounded-full p-3 text-gray-700 opacity-0 group-hover/feature-slider:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                 <button
                  onClick={scrollRight}
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl border border-gray-100 rounded-full p-3 text-gray-700 opacity-0 group-hover/feature-slider:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Horizontal Scroll Container */}
                <div
                  ref={scrollContainerRef}
                   className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-8 -mx-4 px-4 md:mx-0 md:px-0"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {displayedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[280px]"
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
              </>
            ) : (
              /* List Layout - Vertical Stack */
              <div className="space-y-4">
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
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
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">
              No products found for this selection.
            </p>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onViewAll?.(activeFilter)}
            className="w-full border-gray-300"
          >
            View All Collection
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
