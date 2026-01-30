"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, List, Loader2 } from "lucide-react";
import { Product, ProductFilters } from "@/types/productTypes";
import { ProductCard } from "@/components/ui/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { FilterBar } from "@/components/products/FilterBar";
import { SortModal } from "@/components/products/SortModal";
import { FilterModal } from "@/components/products/FilterModal";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { cn } from "@/utils/cn";

interface ProductListingLayoutProps {
  title: string;
  subtitle?: string;
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  loading: boolean;
  error?: Error | null;
  activeFilters: ProductFilters;
  onFilterChange: (newFilters: ProductFilters) => void;
  onPageChange: (page: number) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  hideSidebar?: boolean; // Option to hide sidebar if needed (e.g. strict requirement)
}

export const ProductListingLayout: React.FC<ProductListingLayoutProps> = ({
  title,
  subtitle,
  products,
  totalProducts,
  currentPage,
  totalPages,
  itemsPerPage,
  loading,
  error,
  activeFilters,
  onFilterChange,
  onPageChange,
  onAddToCart,
  onQuickView,
  hideSidebar = false,
}) => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // This is now purely for opening the modal on mobile
  // The Desktop select works independently via the select onChange
  const handleSortClick = () => {
     setIsSortModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Filter Bar (Sticky) */}
      <div className="block lg:hidden sticky top-[64px] z-30">
          <FilterBar
            onFilterClick={() => setIsFilterModalOpen(true)}
            onSortClick={handleSortClick}
            activeFilterCount={Object.keys(activeFilters).filter(k => !['page','limit','sort','search'].includes(k) && activeFilters[k as keyof ProductFilters]).length}
          />
      </div>

     <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        currentSort={activeFilters.sort}
        onApplySort={(sort) => {
            onFilterChange({ ...activeFilters, sort, page: 1 });
        }}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={(filters) => {
            onFilterChange({ ...activeFilters, ...filters, page: 1 });
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-28">
        
        {/* Header Section */}
        <div className="flex flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
             {/* Desktop Sort Dropdown */}
             <div className="hidden lg:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                <span className="text-gray-500">Sort:</span>
                <select 
                    value={activeFilters.sort || "newest"}
                    onChange={(e) => onFilterChange({...activeFilters, sort: e.target.value as ProductFilters['sort'], page: 1})}
                    className="bg-transparent font-medium outline-none cursor-pointer"
                >
                    <option value="newest">Newest</option>
                    <option value="popularity">Popularity</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
             </div>

             {/* Layout Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setLayout("grid")}
                className={cn(
                  "p-1.5 rounded transition-all duration-200",
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
                  "p-1.5 rounded transition-all duration-200",
                  layout === "list"
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
            {/* Desktop Sidebar */}
            {!hideSidebar && (
                <div className="hidden lg:block sticky top-28"> 
                    <FilterSidebar 
                        activeFilters={activeFilters}
                        onApplyFilters={(filters) => onFilterChange({...activeFilters, ...filters, page: 1})}
                    />
                </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 w-full min-w-0">
                 {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span className="ml-3 text-lg text-gray-600">Loading products...</span>
                    </div>
                 ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl">
                        <p className="text-red-600 text-lg">Failed to load products.</p>
                        <button onClick={() => window.location.reload()} className="mt-4 underline text-red-800">Try Again</button>
                    </div>
                 ) : products && products.length > 0 ? (
                     <>
                        <motion.div
                            layout
                            className={cn(
                                "grid gap-x-3 gap-y-6 sm:gap-4",
                                layout === "grid" 
                                    ? "grid-cols-2 lg:grid-cols-3" 
                                    : "grid-cols-1"
                            )}
                        >
                             {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <ProductCard
                                        product={product}
                                        onQuickView={onQuickView}
                                        onAddToCart={onAddToCart}
                                        onToggleWishlist={() => {}}
                                        layout={layout === "list" ? "horizontal" : "vertical"}
                                    />
                                </motion.div>
                             ))}
                        </motion.div>

                        <div className="mt-12">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                                totalItems={totalProducts}
                                itemsPerPage={itemsPerPage}
                                showTotalItems={true}
                            />
                        </div>
                     </>
                 ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                        <button 
                            onClick={() => onFilterChange({ page: 1, limit: itemsPerPage })}
                            className="mt-4 text-amber-600 font-medium hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};
