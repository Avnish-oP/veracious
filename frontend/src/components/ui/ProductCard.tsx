"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Share2,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { Product } from "@/types/productTypes";
import { useCartStore } from "@/store/useCartStore";

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { getItemQuantity } = useCartStore();
  const router = useRouter();

  const quantityInCart = getItemQuantity(product.id);
  const isInCart = quantityInCart > 0;

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(product);
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
      MALE: "bg-blue-100 text-blue-800",
      FEMALE: "bg-pink-100 text-pink-800",
      UNISEX: "bg-purple-100 text-purple-800",
    };
    return colors[gender as keyof typeof colors] || colors.UNISEX;
  };

  const cardSizes = {
    sm: layout === "horizontal" ? "w-full" : "w-full max-w-64",
    md: layout === "horizontal" ? "w-full" : "w-full max-w-80",
    lg: layout === "horizontal" ? "w-full" : "w-full max-w-96",
  }; // Horizontal Layout
  if (layout === "horizontal") {
    return (
      <motion.div
        className={cn(
          "group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex items-center",
          cardSizes[size],
          className
        )}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Product Image Container - Horizontal Layout */}
        <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden bg-gray-50">
          {/* Badges */}
          {showBadges && (
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {product.isFeatured && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </motion.div>
              )}
              {discountPercentage > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
                >
                  -{discountPercentage}%
                </motion.div>
              )}
            </div>
          )}

          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              className={cn(
                "w-3 h-3 transition-colors duration-200",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </motion.button>

          {/* Product Image */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsImageLoaded(true)}
              />
            ) : (
              <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info - Horizontal Layout */}
        <div className="flex-1 p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Brand */}
              <p className="text-sm text-gray-500 font-medium">
                {product.brand}
              </p>

              {/* Product Name */}
              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors duration-200 text-lg">
                {product.name}
              </h3>

              {/* Product Details */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {product.frameShape}
                </span>
                <span>•</span>
                <span>{product.frameMaterial}</span>
                <span>•</span>
                <span>{product.frameColor}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mt-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3 h-3",
                        i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">(4.8)</span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex flex-col items-end space-y-2 ml-4">
              <div className="text-right">
                {product.discountPrice ? (
                  <>
                    <span className="text-xl font-bold text-gray-900 block">
                      $
                      {typeof product.discountPrice === "number"
                        ? product.discountPrice.toFixed(2)
                        : product.discountPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      $
                      {typeof product.price === "number"
                        ? product.price.toFixed(2)
                        : product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleQuickView}
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs px-3 py-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <motion.button
                  onClick={handleAddToCart}
                  className={cn(
                    "flex items-center px-3 py-1 text-white text-xs font-medium rounded-lg transition-all duration-200",
                    isInCart
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {isInCart ? `In Cart (${quantityInCart})` : "Add"}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Lens Type Badge */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
              {product.lensType}
            </span>
            <span className="flex items-center text-xs text-gray-500">
              <div
                className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  getGenderColor(product.gender).includes("blue")
                    ? "bg-blue-400"
                    : getGenderColor(product.gender).includes("pink")
                    ? "bg-pink-400"
                    : "bg-purple-400"
                )}
              />
              {product.gender}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Vertical Layout (original)
  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full pb-6 cursor-pointer",
        cardSizes[size],
        className
      )}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {/* Badges */}
        {showBadges && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isFeatured && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </motion.div>
            )}
            {discountPercentage > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
              >
                -{discountPercentage}%
              </motion.div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                getGenderColor(product.gender)
              )}
            >
              {product.gender}
            </motion.div>
          </div>
        )}

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </motion.button>

        {/* Product Image */}
        <div className="w-full h-full flex items-center justify-center p-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={cn(
                "w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setIsImageLoaded(true)}
            />
          ) : (
            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleQuickView}
              className="bg-white text-gray-800 hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 mr-1" />
              Quick View
            </Button>
            <motion.button
              onClick={handleAddToCart}
              className={cn(
                "p-2 text-white rounded-lg transition-colors duration-200 relative",
                isInCart
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-amber-500 hover:bg-amber-600"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4" />
              {isInCart && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-green-600 text-xs rounded-full flex items-center justify-center font-bold border-2 border-green-500">
                  {quantityInCart}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Brand */}
          <p className="text-sm text-gray-500 font-medium">{product.brand}</p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Product Details */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              {product.frameShape}
            </span>
            <span>•</span>
            <span>{product.frameMaterial}</span>
            <span>•</span>
            <span>{product.frameColor}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(4.8)</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  $
                  {typeof product.discountPrice === "number"
                    ? product.discountPrice.toFixed(2)
                    : product.discountPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  $
                  {typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : product.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            className={cn(
              "flex items-center px-3 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200",
              isInCart
                ? "bg-green-500 hover:bg-green-600"
                : "bg-amber-500 hover:bg-amber-600"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isInCart ? `In Cart (${quantityInCart})` : "Add"}
          </motion.button>
        </div>
      </div>

      {/* Lens Type Badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 px-4 py-2 border-t">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-amber-400 rounded-full mr-2" />
            {product.lensType}
          </span>
          <button className="hover:text-amber-600 transition-colors duration-200">
            <Share2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
