"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { ProductFilters } from "@/types/productTypes";
import { cn } from "@/utils/cn";

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: ProductFilters["sort"];
  onApplySort: (sort: ProductFilters["sort"]) => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  currentSort = "newest",
  onApplySort,
}) => {
  const sortOptions = [
    { id: "newest", label: "Newest Arrivals" },
    { id: "popularity", label: "Best Sellers" },
    { id: "price_asc", label: "Price: Low to High" },
    { id: "price_desc", label: "Price: High to Low" },
  ];

  const handleSelect = (sortId: string) => {
    onApplySort(sortId as ProductFilters["sort"]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm lg:hidden"
          />

          {/* Modal (Bottom Sheet style) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl lg:hidden overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Sort By</h3>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2 pb-8">
              {sortOptions.map((option) => {
                const isSelected = currentSort === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200",
                      isSelected
                        ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
                        : "bg-white text-gray-700 border border-gray-100 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn("font-medium", isSelected && "font-bold")}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="bg-amber-500 rounded-full p-1">
                         <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
