"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Product } from "@/types/productTypes";
import { ProductCard } from "@/components/ui/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-hot-toast";
import { QuickViewModal } from "@/components/products/QuickViewModal";

interface RecentlyViewedProps {
  products: Product[];
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ products }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [quickViewProductId, setQuickViewProductId] = React.useState<
    string | null
  >(null);
  const { addToCart } = useCartStore();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const scroll = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      {quickViewProductId && (
        <QuickViewModal
          isOpen={!!quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          productId={quickViewProductId}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
            className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-2">
                <History className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide uppercase">History</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Recently Viewed</h2>
          </div>
          
          {products.length > 4 && (
            <div className="flex gap-2">
                <button
                onClick={() => scroll(-320)}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-white hover:border-amber-300 transition-colors shadow-sm"
                >
                <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                onClick={() => scroll(320)}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-white hover:border-amber-300 transition-colors shadow-sm"
                >
                <ChevronRight className="w-5 h-5" />
                </button>
            </div>
          )}
        </motion.div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-72"
            >
              <ProductCard
                product={product}
                onQuickView={(p) => setQuickViewProductId(p.id)}
                onAddToCart={handleAddToCart}
                size="md"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
