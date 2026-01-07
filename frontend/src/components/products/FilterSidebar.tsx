"use client";

import React from "react";
import { useProductFilters } from "@/hooks/useProducts";
import { cn } from "@/utils/cn";
import { ProductFilters } from "@/types/productTypes";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  activeFilters: ProductFilters;
  onApplyFilters: (filters: ProductFilters) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeFilters,
  onApplyFilters,
}) => {
  const { data: filterOptions, isLoading } = useProductFilters(activeFilters);
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
    gender: true,
  });

  // Local state for price inputs to debounce API calls
  const [localPrice, setLocalPrice] = React.useState<{ min: string, max: string }>({
    min: activeFilters.minPrice?.toString() || "",
    max: activeFilters.maxPrice?.toString() || ""
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSelection = (key: "category" | "brand" | "gender", value: string) => {
    const current = activeFilters[key] ? activeFilters[key]!.split(",") : [];
    let updated: string[];

    if (current.includes(value)) {
      updated = current.filter((item) => item !== value);
    } else {
      updated = [...current, value];
    }

    onApplyFilters({
      ...activeFilters,
      [key]: updated.length > 0 ? updated.join(",") : undefined,
      page: 1, // Reset page on filter change
    });
  };

  const handleClearAll = () => {
    onApplyFilters({
      page: 1,
      limit: activeFilters.limit,
      sort: activeFilters.sort,
      search: activeFilters.search,
      filter: activeFilters.filter,
      category: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      gender: undefined,
    });
  };

  // Sync local state when activeFilters change externally
  React.useEffect(() => {
     setLocalPrice({
         min: activeFilters.minPrice?.toString() || "",
         max: activeFilters.maxPrice?.toString() || ""
     });
  }, [activeFilters.minPrice, activeFilters.maxPrice]);

  // Debounce effect for price
  React.useEffect(() => {
    const timer = setTimeout(() => {
       const min = localPrice.min ? Number(localPrice.min) : undefined;
       const max = localPrice.max ? Number(localPrice.max) : undefined;

       if (min !== activeFilters.minPrice || max !== activeFilters.maxPrice) {
           onApplyFilters({
               ...activeFilters,
               minPrice: min,
               maxPrice: max,
               page: 1
           });
       }
    }, 600);

    return () => clearTimeout(timer);
  }, [localPrice, activeFilters, onApplyFilters]);

  const handlePriceChange = (key: "min" | "max", value: string) => {
      setLocalPrice(prev => ({ ...prev, [key]: value }));
  }

  if (isLoading) {
    return (
      <div className="w-64 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] custom-scrollbar pr-2">
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-10 py-2">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button 
            onClick={handleClearAll}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
        >
            Clear All
        </button>
      </div>

      {/* Category Section */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <span className="font-semibold text-gray-700">Category</span>
          {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.category && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {filterOptions?.categories.map((cat) => {
              const isSelected = activeFilters.category?.split(",").includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleSelection("category", cat.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected ? "bg-amber-500 border-amber-500" : "border-gray-300 group-hover:border-amber-500"
                  )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={cn("text-sm transition-colors", isSelected ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900")}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brand Section */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("brand")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <span className="font-semibold text-gray-700">Brand</span>
          {openSections.brand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.brand && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {filterOptions?.brands.map((brand) => {
              const isSelected = activeFilters.brand?.split(",").includes(brand);
              return (
                 <div
                  key={brand}
                  onClick={() => toggleSelection("brand", brand)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected ? "bg-amber-500 border-amber-500" : "border-gray-300 group-hover:border-amber-500"
                  )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={cn("text-sm transition-colors", isSelected ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900")}>
                    {brand}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

       {/* Gender Section */}
       <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("gender")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <span className="font-semibold text-gray-700">Gender</span>
          {openSections.gender ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.gender && (
          <div className="mt-2 space-y-2">
            {filterOptions?.genders.map((gender) => {
              const isSelected = activeFilters.gender?.split(",").includes(gender);
              return (
                 <div
                  key={gender}
                  onClick={() => toggleSelection("gender", gender)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected ? "bg-amber-500 border-amber-500" : "border-gray-300 group-hover:border-amber-500"
                  )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={cn("text-sm transition-colors", isSelected ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900")}>
                    {gender}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <span className="font-semibold text-gray-700">Price Range</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.price && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1">
                <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={localPrice.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    style={{ color: '#111827' }} 
                />
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex-1">
                <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={localPrice.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    style={{ color: '#111827' }} 
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
