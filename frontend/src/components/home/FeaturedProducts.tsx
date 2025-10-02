"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  onViewAll?: () => void;
}

const filterOptions = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "featured", label: "Featured", icon: Sparkles },
  { id: "top-rated", label: "Top Rated", icon: Star },
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Classic Aviator Premium Edition",
    slug: "classic-aviator-premium",
    brand: "Ray-Ban",
    price: 199.99,
    discountPrice: 149.99,
    stock: 50,
    sku: "RB-AV-001",
    frameShape: "AVIATOR",
    frameMaterial: "Metal",
    frameColor: "Gold",
    lensType: "Polarized",
    lensColor: "Brown",
    gender: "UNISEX",
    isFeatured: true,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Modern Wayfarer Collection",
    slug: "modern-wayfarer",
    brand: "Oakley",
    price: 159.99,
    stock: 30,
    sku: "OAK-WF-002",
    frameShape: "WAYFARER",
    frameMaterial: "Acetate",
    frameColor: "Black",
    lensType: "UV Protection",
    lensColor: "Gray",
    gender: "MALE",
    isFeatured: true,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Elegant Cat Eye Designer",
    slug: "elegant-cat-eye",
    brand: "Gucci",
    price: 299.99,
    discountPrice: 249.99,
    stock: 20,
    sku: "GUC-CE-003",
    frameShape: "CAT_EYE",
    frameMaterial: "Acetate",
    frameColor: "Tortoiseshell",
    lensType: "Gradient",
    lensColor: "Brown",
    gender: "FEMALE",
    isFeatured: true,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Sport Performance Pro",
    slug: "sport-performance-pro",
    brand: "Nike",
    price: 129.99,
    stock: 75,
    sku: "NIK-SP-004",
    frameShape: "GEOMETRIC",
    frameMaterial: "Plastic",
    frameColor: "Blue",
    lensType: "Mirrored",
    lensColor: "Silver",
    gender: "UNISEX",
    isFeatured: false,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products = mockProducts,
  loading = false,
  error,
  onLoadMore,
  onViewAll,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4;

  const filteredProducts = products.filter((product) => {
    switch (activeFilter) {
      case "trending":
        return product.discountPrice; // Assuming products with discounts are trending
      case "featured":
        return product.isFeatured;
      case "top-rated":
        return true; // All products for demo, could filter by rating
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = currentPage * productsPerPage;
  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
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
          <Button onClick={onLoadMore} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section
      id="featured-products"
      className="py-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Featured Collection
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Our{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Premium Selection
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked sunglasses from the world's most prestigious brands,
            designed to elevate your style and protect your vision.
          </p>
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
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => {
                    setActiveFilter(option.id);
                    setCurrentPage(0);
                  }}
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

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors duration-200",
                  viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors duration-200",
                  viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onViewAll}
              className="hidden sm:flex"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
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

        {/* Products Grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeFilter}-${currentPage}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn(
                "gap-6",
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr"
                  : "flex flex-col space-y-4"
              )}
            >
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="flex justify-center"
                >
                  <ProductCard
                    product={product}
                    onQuickView={(product) =>
                      console.log("Quick view:", product)
                    }
                    onAddToCart={(product) =>
                      console.log("Add to cart:", product)
                    }
                    onToggleWishlist={(product) =>
                      console.log("Toggle wishlist:", product)
                    }
                    size={viewMode === "list" ? "lg" : "md"}
                    layout={viewMode === "list" ? "horizontal" : "vertical"}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center space-x-4 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium transition-all duration-200",
                    currentPage === index
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-amber-100"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={onViewAll}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Explore Full Collection
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
