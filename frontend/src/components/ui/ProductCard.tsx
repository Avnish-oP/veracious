"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Sparkles,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { Product } from "@/types/productTypes";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  className?: string;
  showBadges?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "vertical" | "horizontal";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  className,
  showBadges = true,
  size = "md",
  layout = "vertical",
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  const quantityInCart = getItemQuantity(product.id);
  const isInCart = quantityInCart > 0;
  const isWishlisted = isInWishlist(product.id);

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleWishlist(product.id);
      onToggleWishlist?.(product);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const getGenderColor = (gender: string) => {
    const colors = {
      MALE: "bg-blue-50 text-blue-700 border-blue-100",
      FEMALE: "bg-pink-50 text-pink-700 border-pink-100",
      UNISEX: "bg-purple-50 text-purple-700 border-purple-100",
    };
    return colors[gender as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  // Horizontal Layout
  if (layout === "horizontal") {
    return (
      <motion.div
        className={cn(
          "group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex w-full h-auto sm:h-56",
          className
        )}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Left: Image Area */}
        <div className="relative w-[35%] sm:w-[30%] bg-gray-50 flex-shrink-0 border-r border-gray-100 flex items-center justify-center">
           {showBadges && discountPercentage > 0 && (
              <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                 -{discountPercentage}%
              </span>
           )}
           <div className="relative w-full h-32 sm:h-full p-2">
             {product.image || product.images?.[0]?.url ? (
                <Image
                  src={product.image || product.images?.[0]?.url || ""}
                  alt={product.name}
                  fill
                  className={cn(
                    "object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105",
                    isImageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setIsImageLoaded(true)}
                  sizes="(max-width: 640px) 150px, 200px"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                   <Eye className="w-10 h-10" />
                </div>
             )}
           </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-3 sm:p-5 flex flex-col min-w-0">
           {/* Header */}
           <div className="flex justify-between items-start mb-1">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{product.brand}</p>
                    {product.categories?.[0]?.name && (
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {product.categories[0].name}
                        </span>
                    )}
                 </div>
                 <h3 
                    onClick={handleCardClick}
                    className="font-bold text-gray-900 text-base sm:text-lg line-clamp-1 cursor-pointer hover:text-amber-600 transition-colors"
                 >
                    {product.name}
                 </h3>
              </div>
              
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">{product.averageRating?.toFixed(1) ?? 'N/A'}</span>
               </div>
           </div>

           {/* Description (Hidden on very small screens) */}
           {product.description && (
            <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
               {product.description}
            </p>
           )}

           {/* Attributes */}
           <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mb-auto">
              <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  <Tag className="w-3 h-3 mr-1 text-gray-400"/> {product.frameShape}
              </span>
              <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  {product.frameMaterial}
              </span>
              <span className={cn("px-2 py-1 rounded border", getGenderColor(product.gender))}>
                  {product.gender}
              </span>
           </div>

           {/* Footer: Price & Action */}
           <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-50 gap-2">
              <div className="flex flex-col min-w-0">
                  {product.discountPrice ? (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                       <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.discountPrice}</span>
                       <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                    </div>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.price}</span>
                  )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                 <button 
                    onClick={handleWishlistToggle}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                 >
                    <Heart className={cn("w-5 h-5", isWishlisted && "fill-red-500 text-red-500")} />
                 </button>
                 <Button
                    onClick={handleAddToCart}
                    size="sm"
                    className={cn(
                      "rounded-lg text-xs font-medium shadow-sm transition-all whitespace-nowrap",
                      isInCart 
                         ? "bg-green-600 hover:bg-green-700 text-white" 
                         : "bg-gray-900 hover:bg-gray-800 text-white"
                    )}
                 >
                    {isInCart ? "In Cart" : "Add to Cart"}
                 </Button>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  // Vertical Layout (Modern Mobile Optimized)
  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full w-full cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 1. Image Container - 4:3 Aspect Ratio (Landscape-ish / Squatter than portrait) */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden w-full">
         {/* Badges - Minimalist Pills */}
        {showBadges && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
             {product.isFeatured && (
                <span className="bg-white/90 backdrop-blur-sm text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm border border-amber-100 flex items-center">
                   <Sparkles className="w-2.5 h-2.5 mr-1" /> Featured
                </span>
             )}
             {discountPercentage > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                   -{discountPercentage}%
                </span>
             )}
          </div>
        )}

        {/* Wishlist Button (Always accessible) */}
        <button
           onClick={handleWishlistToggle}
           className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm group-hover:scale-110"
        >
           <Heart className={cn("w-4 h-4 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
        </button>

        {/* Image - Fill using object-cover */}
        <div className="absolute inset-0 flex items-center justify-center">
          {product.image || product.images?.[0]?.url ? (
              <Image
                src={product.image || product.images?.[0]?.url || ""}
                alt={product.name}
                fill
                className={cn(
                  "object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-4",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsImageLoaded(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
          ) : (
              <div className="text-gray-300">
                 <Eye className="w-10 h-10" />
              </div>
          )}
        </div>

        {/* Quick Actions Overlay (Desktop only) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex justify-center bg-gradient-to-t from-white/90 to-transparent pt-6">
            <Button 
                onClick={handleQuickView}
                className="bg-white text-gray-800 hover:bg-gray-100 text-xs px-4 py-1.5 h-auto shadow-md border border-gray-100 rounded-full"
            >
               Quick View
            </Button>
        </div>
      </div>

      {/* 2. Content Container - Clean & Spaced */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
         {/* Brand */}
         <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[70%]">
               {product.brand}
            </span>
             <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-semibold text-gray-600">{product.averageRating?.toFixed(1) ?? 'N/A'}</span>
             </div>
         </div>

         {/* Title */}
         <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors min-h-[2.5em]">
            {product.name}
         </h3>

         {/* Meta Tags (Subtle) */}
         <div className="flex flex-wrap gap-1 mt-auto">
             <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-100 truncate max-w-full")}>
                {product.frameShape}
             </span>
             <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border truncate max-w-full", getGenderColor(product.gender))}>
                {product.gender}
             </span>
         </div>

         {/* Price Row */}
         <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-50">
            <div className="flex flex-col leading-none">
               {product.discountPrice ? (
                   <div className="flex items-baseline gap-1.5">
                     <span className="text-base font-bold text-gray-900">₹{product.discountPrice}</span>
                     <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>
                   </div>
               ) : (
                   <span className="text-base font-bold text-gray-900">₹{product.price}</span>
               )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
               onClick={handleAddToCart}
               className={cn(
                 "p-2 rounded-full shadow-sm transition-all active:scale-95",
                  isInCart ? "bg-green-100 text-green-700" : "bg-gray-900 text-white hover:bg-gray-800"
               )}
               whileTap={{ scale: 0.9 }}
            >
                <ShoppingCart className="w-4 h-4" />
            </motion.button>
         </div>
      </div>
    </motion.div>
  );
};
