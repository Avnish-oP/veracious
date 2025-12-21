"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSearchSuggestions } from "@/services/search";
import { cn } from "@/utils/cn";

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onClose, className, autoFocus = false }) => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sync query with URL changes
  useEffect(() => {
    const currentQuery = searchParams.get("query") || "";
    if (query !== currentQuery && !isOpen) { // Only sync if not typing/interacting
        // setQuery(currentQuery); // Actually, we might not want to overwrite user typing if they are typing.
        // Let's just initialize it.
    }
  }, [searchParams]);

  // Debounce logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        const results = await getSearchSuggestions(query);
        setSuggestions(results);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, query]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    if (onClose) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    } else if (e.key === "Escape") {
        if(onClose) onClose();
        setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          autoFocus={autoFocus}
          className="w-full py-2 pl-10 pr-10 text-gray-900 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
        />
        {query && (
            <button 
                onClick={() => setQuery("")}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            <ul>
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSearch(item.text)} 
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                  >
                    {item.image ? (
                        <div className="w-10 h-10 relative flex-shrink-0">
                            <img src={item.image} alt={item.text} className="w-full h-full object-cover rounded-md" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                             <Search className="w-5 h-5 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <span className="block text-sm font-medium text-gray-800">
                        {item.text}
                        </span>
                        {item.price && <span className="text-xs text-amber-600 font-semibold">${item.price}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
