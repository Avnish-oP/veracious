"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useProductFilters } from "@/hooks/useProducts";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/form-components";
import { ProductFilters } from "@/types/productTypes";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: ProductFilters;
  onApplyFilters: (filters: ProductFilters) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
}) => {
  const { data: filterOptions, isLoading } = useProductFilters(activeFilters);
  const [localFilters, setLocalFilters] = useState<ProductFilters>(activeFilters);

  const [activeTab, setActiveTab] = useState<"category" | "brand" | "price" | "gender">("category");

  // Reset local state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(activeFilters);
    }
  }, [isOpen, activeFilters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({
      page: 1,
      limit: activeFilters.limit,
      sort: activeFilters.sort,
      search: activeFilters.search, 
      filter: activeFilters.filter,
      // Clear specific filters
      category: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      gender: undefined,
    });
  };

  const toggleSelection = (key: "category" | "brand" | "gender", value: string) => {
    const current = localFilters[key] ? localFilters[key]!.split(",") : [];
    let updated: string[];

    if (current.includes(value)) {
      updated = current.filter((item) => item !== value);
    } else {
      updated = [...current, value];
    }

    setLocalFilters({
      ...localFilters,
      [key]: updated.length > 0 ? updated.join(",") : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl h-[85vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-1/3 bg-gray-50 border-r overflow-y-auto">
                {["category", "brand", "price", "gender"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as "category" | "brand" | "price" | "gender")}
                    className={cn(
                      "w-full text-left px-4 py-4 text-sm font-medium transition-colors border-l-4",
                      activeTab === tab
                        ? "bg-white border-amber-500 text-amber-600"
                        : "border-transparent text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {localFilters[tab as keyof ProductFilters] && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "category" && (
                  <div className="space-y-2">
                    {filterOptions?.categories.map((cat) => {
                       const isSelected = localFilters.category?.split(",").includes(cat.id);
                       return (
                        <div
                            key={cat.id}
                            onClick={() => toggleSelection("category", cat.id)}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                         >
                            <span className={cn("text-sm", isSelected ? "font-medium text-amber-600" : "text-gray-700")}>
                                {cat.name}
                            </span>
                             {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                       )
                    })}
                  </div>
                )}

                {activeTab === "brand" && (
                  <div className="space-y-2">
                     {filterOptions?.brands.map((brand) => {
                       const isSelected = localFilters.brand?.split(",").includes(brand);
                       return (
                        <div
                            key={brand}
                            onClick={() => toggleSelection("brand", brand)}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                         >
                            <span className={cn("text-sm", isSelected ? "font-medium text-amber-600" : "text-gray-700")}>
                                {brand}
                            </span>
                             {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                       )
                    })}
                  </div>
                )}

                {activeTab === "gender" && (
                   <div className="space-y-2">
                   {filterOptions?.genders.map((gender) => {
                     const isSelected = localFilters.gender?.split(",").includes(gender);
                     return (
                      <div
                          key={gender}
                          onClick={() => toggleSelection("gender", gender)}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                       >
                          <span className={cn("text-sm", isSelected ? "font-medium text-amber-600" : "text-gray-700")}>
                              {gender}
                          </span>
                           {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                     )
                  })}
                </div>
                )}

                {activeTab === "price" && (
                  <div className="p-4">
                    <p className="text-sm text-gray-900 mb-4 font-medium">Price Range</p>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <label className="text-xs text-gray-700 mb-1 block">Min Price</label>
                            <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-amber-500"
                                placeholder={filterOptions?.minPrice.toString()}
                                value={localFilters.minPrice ?? ""}
                                onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value ? Number(e.target.value) : undefined})}
                                style={{ color: '#111827' }} 
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="flex-1">
                             <label className="text-xs text-gray-700 mb-1 block">Max Price</label>
                             <input 
                                type="number" 
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-amber-500"
                                placeholder={filterOptions?.maxPrice.toString()}
                                value={localFilters.maxPrice ?? ""}
                                onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value ? Number(e.target.value) : undefined})}
                                style={{ color: '#111827' }} 
                            />
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 border-t flex gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Apply Application ({Object.keys(localFilters).filter(k => !['sort', 'page', 'limit', 'search'].includes(k) && localFilters[k as keyof ProductFilters]).length})
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
