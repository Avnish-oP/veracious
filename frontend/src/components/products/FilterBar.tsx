"use client";

import React from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  onFilterClick: () => void;
  onSortClick: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onFilterClick,
  onSortClick,
  activeFilterCount,
}) => {
  return (
    <div className="md:hidden sticky top-[64px] z-30 bg-white border-b border-gray-200">
      <div className="flex divide-x divide-gray-200">
        <button
          onClick={onSortClick}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 active:bg-gray-50"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort</span>
        </button>
        <button
          onClick={onFilterClick}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 active:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
