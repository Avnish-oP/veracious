"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Loader2,
  Grid3X3,
  List,
} from "lucide-react";
import {
  useProducts,
  useFeaturedProducts,
  useTrendingProducts,
} from "@/hooks/useProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/form-components";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-hot-toast";
import { Product } from "@/types/productTypes";
import { cn } from "@/utils/cn";
import { QuickViewModal } from "@/components/products/QuickViewModal";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter") || "all";
  const { addToCart } = useCartStore();

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState(filterParam);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(
    null
  );

  // Update active filter when URL changes
  useEffect(() => {
    setActiveFilter(filterParam);
    setPage(1); // Reset to first page when filter changes
  }, [filterParam]);

  // Read category from URL search param (e.g. /products?category=<categoryId>)
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    setCategory(urlCategory);
    setPage(1);
  }, [searchParams]);

  // Conditionally fetch products based on active filter
  const shouldFetchAll = activeFilter === "all";
  const shouldFetchFeatured = activeFilter === "featured";
  const shouldFetchTrending = activeFilter === "trending";

  // Fetch products based on active filter
  const allProductsQuery = useProducts({
    page,
    limit,
    search: search || undefined,
    category: category || undefined,
  });

  const featuredProductsQuery = useFeaturedProducts({
    page,
    limit,
  });

  const trendingProductsQuery = useTrendingProducts({
    page,
    limit,
  });

  // Select the appropriate data based on filter
  const productsData = shouldFetchFeatured
    ? featuredProductsQuery.data
    : shouldFetchTrending
    ? trendingProductsQuery.data
    : allProductsQuery.data;

  const isLoading = shouldFetchFeatured
    ? featuredProductsQuery.isLoading
    : shouldFetchTrending
    ? trendingProductsQuery.isLoading
    : allProductsQuery.isLoading;

  const error = shouldFetchFeatured
    ? featuredProductsQuery.error
    : shouldFetchTrending
    ? trendingProductsQuery.error
    : allProductsQuery.error;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  // Handle quick view
  const handleQuickView = (product: Product) => {
    setQuickViewProductId(product.id);
  };

  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      {/* Quick View Modal */}
      {quickViewProductId && (
        <QuickViewModal
          isOpen={!!quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          productId={quickViewProductId}
        />
      )}
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {activeFilter === "featured"
                ? "Featured Products"
                : activeFilter === "trending"
                ? "Trending Products"
                : "All Products"}
            </h1>
            <p className="text-lg text-gray-600">
              {activeFilter === "featured"
                ? "Our handpicked selection of premium eyewear"
                : activeFilter === "trending"
                ? "The hottest styles everyone is loving"
                : "Discover our complete collection of premium eyewear"}
            </p>
          </motion.div>

          {/* Layout Toggle */}
          <div className="mt-6 flex justify-end">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
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
                <Grid3X3 className="w-5 h-5" />
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
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="ml-3 text-lg text-gray-600">
              Loading products...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">
              Failed to load products. Please try again.
            </p>
          </div>
        ) : productsData && productsData.products.length > 0 ? (
          <>
            {/* Products Display */}
            {layout === "grid" ? (
              /* Grid Layout */
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {productsData.products.map((product, index) => (
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
                      onToggleWishlist={(p) =>
                        console.log("Toggle wishlist:", p)
                      }
                      layout="vertical"
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* List Layout */
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {productsData.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={handleQuickView}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={(p) =>
                        console.log("Toggle wishlist:", p)
                      }
                      layout="horizontal"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={productsData.page || page}
                totalPages={productsData.totalPages || 1}
                onPageChange={handlePageChange}
                totalItems={productsData.total}
                itemsPerPage={productsData.limit || limit}
                showTotalItems={true}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              No products found. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
