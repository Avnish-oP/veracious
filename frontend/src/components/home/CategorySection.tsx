"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { Product } from "@/types/productTypes";

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categoryId: string; // Slug or ID
  linkTo: string;
  bgColor?: string; // Optional background color class
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  subtitle,
  categoryId,
  linkTo,
  bgColor = "bg-white",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [quickViewProductId, setQuickViewProductId] = React.useState<
    string | null
  >(null);
  const { addToCart, isUserLoading } = useCart();

  const { data, isLoading, error } = useProducts({
    category: categoryId,
    limit: 8,
  });

  const products = data?.products || [];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (isUserLoading) {
      toast.error("Please login to add to cart");
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (_error) {
      toast.error("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <section className={`py-12 ${bgColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 md:py-24 ${bgColor} overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link
              href={linkTo}
              className="group inline-flex items-center text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          {/* Desktop Scroll Buttons */}
          <div className="hidden md:block">
            <button
              onClick={scrollLeft}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-xl text-gray-700 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-xl text-gray-700 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Product List */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[300px]"
              >
                <div className="transform transition-transform duration-300 hover:-translate-y-1 h-full">
                  <ProductCard
                    product={product}
                    onQuickView={(p) => setQuickViewProductId(p.id)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={() => {}}
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
        
      {quickViewProductId && (
        <QuickViewModal
          isOpen={!!quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          productId={quickViewProductId}
        />
      )}
    </section>
  );
};
