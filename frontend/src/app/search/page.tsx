"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { searchProducts } from "@/services/search";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion } from "framer-motion";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const [filter, setFilter] = useState(""); 
  const [sort, setSort] = useState("");
  
  // Ref for intersection observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + 20); // increment offset (assuming limit 20)
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);


  // Initial Fetch & Reset on query/filter change
  useEffect(() => {
    if (!query) return;
    
    setResults([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);

    const fetchInitial = async () => {
        try {
            const data = await searchProducts(query, { filter, sort, limit: 20, offset: 0 });
            const formatted = formatResults(data);
            setResults(formatted);
            setHasMore(data.length === 20);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    fetchInitial();

  }, [query, filter, sort]);

  // Load More logic
  useEffect(() => {
      if (offset === 0 || !query) return; // Already handled by initial fetch

      const fetchMore = async () => {
          setLoadingMore(true);
          try {
              const data = await searchProducts(query, { filter, sort, limit: 20, offset });
              const formatted = formatResults(data);
              
              setResults(prev => {
                  const existingIds = new Set(prev.map(p => p.id));
                  const newUnique = formatted.filter((p: any) => !existingIds.has(p.id));
                  return [...prev, ...newUnique];
              });
              if (data.length < 20) setHasMore(false); 
          } catch(e) {
              console.error(e);
          } finally {
              setLoadingMore(false);
          }
      }
      
      fetchMore();
  }, [offset, query, filter, sort]);


  const formatResults = (data: any[]) => {
      return data.map((hit: any) => ({
          id: hit.id,
          name: hit.metadata?.name || hit.content?.name || "Unknown Product",
          price: hit.metadata?.price || 0,
          originalPrice: hit.metadata?.discountPrice ? hit.metadata.price : undefined, 
          discountPrice: hit.metadata?.discountPrice,
          description: hit.content?.description,
          image: hit.metadata?.image || "/placeholder.png",
          brand: hit.content?.brand,
          slug: hit.metadata?.slug,
          stock: hit.metadata?.stock,
          rating: 4.8, // Using a static high rating as placeholder consistent with other views or fetch real if available
          reviewCount: 10,
          // New visual/spec fields
          isFeatured: hit.metadata?.isFeatured,
          frameShape: hit.metadata?.frameShape,
          frameMaterial: hit.metadata?.frameMaterial,
          frameColor: hit.metadata?.frameColor,
          lensType: hit.metadata?.lensType,
          gender: hit.metadata?.gender,
      }));
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600 mt-2">
             {/* Note: Total count isn't returned by generic search usually unless asked. We show rendered count. */}
             Showing results
          </p>
        </div>

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
            <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500"
            >
                <option value="">Sort By</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
            </select>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
                 ))}
             </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product, index) => {
                if (index === results.length - 1) {
                    return (
                        <motion.div
                            ref={lastElementRef}
                            key={`${product.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    )
                } else {
                    return (
                        <motion.div
                            key={`${product.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    )
                }
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700">
              No results found
            </h2>
            <p className="text-gray-500 mt-2">
              Try checking your spelling or use different keywords.
            </p>
          </div>
        )}
        
        {loadingMore && (
            <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}
        
        {!hasMore && results.length > 0 && (
            <div className="py-8 text-center text-gray-500">
                You have reached the end of results.
            </div>
        )}
      </div>
    </div>
  );
}
