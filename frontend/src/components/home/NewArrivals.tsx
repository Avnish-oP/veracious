"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Product } from "@/types/productTypes";
import { ProductCard } from "@/components/ui/ProductCard";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import { QuickViewModal } from "@/components/products/QuickViewModal";

interface NewArrivalsProps {
  products: Product[];
  loading?: boolean;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  loading,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [quickViewProductId, setQuickViewProductId] = React.useState<
    string | null
  >(null);
  const { addToCart } = useCart();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (_error) {
      toast.error("Failed to add item to cart");
    }
  };

  const scroll = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      {quickViewProductId && (
        <QuickViewModal
          isOpen={!!quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          productId={quickViewProductId}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full md:w-auto text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Just Arrived</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
              New Arrivals
            </h2>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll(-350)}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(350)}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="relative group/slider">
          {/* Mobile Controls (Absolute Overlay) */}
          <div className="md:hidden absolute top-1/2 -translate-y-1/2 left-0 z-10">
             <button
              onClick={() => scroll(-280)}
              className="p-2 rounded-full bg-white/90 shadow-lg text-gray-800 border border-gray-100 backdrop-blur-sm active:scale-95 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
           <div className="md:hidden absolute top-1/2 -translate-y-1/2 right-0 z-10">
             <button
              onClick={() => scroll(280)}
              className="p-2 rounded-full bg-white/90 shadow-lg text-gray-800 border border-gray-100 backdrop-blur-sm active:scale-95 transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[300px]"
              >
                <div className="transform transition-transform duration-500 hover:-translate-y-1 h-full"> 
                  <ProductCard
                    product={product}
                    onQuickView={(p) => setQuickViewProductId(p.id)}
                    onAddToCart={handleAddToCart}
                    size="md"
                  />
                </div>
              </motion.div>
            ))}
          </div>
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
