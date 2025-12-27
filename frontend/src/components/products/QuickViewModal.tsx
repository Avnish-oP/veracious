"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Product } from "@/types/productTypes";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { useProductDetail } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  onClose,
  productId,
}) => {
  const { data, isLoading, error } = useProductDetail(productId);
  const { addToCart, isUserLoading } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const product = data?.product;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const discountPercentage = product?.discountPrice
    ? Math.round(
        ((Number(product.price) - Number(product.discountPrice)) /
          Number(product.price)) *
          100
      )
    : 0;

  const nextImage = () => {
    if (product?.images && selectedImageIndex < product.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="overflow-y-auto max-h-[90vh]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <p className="text-red-600">
                      Failed to load product details
                    </p>
                  </div>
                ) : product ? (
                  <div className="grid md:grid-cols-2 gap-8 p-6">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <>
                            <Image
                              src={
                                product.images[selectedImageIndex]?.url ||
                                product.images[0]?.url
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                            />

                            {/* Navigation Arrows */}
                            {product.images.length > 1 && (
                              <>
                                <button
                                  onClick={prevImage}
                                  disabled={selectedImageIndex === 0}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                  onClick={nextImage}
                                  disabled={
                                    selectedImageIndex ===
                                    product.images.length - 1
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  <ChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                              </>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              {product.isFeatured && (
                                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                                  Featured
                                </span>
                              )}
                              {discountPercentage > 0 && (
                                <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                                  -{discountPercentage}%
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingCart className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Images */}
                      {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {product.images.map((image, index) => (
                            <button
                              key={image.id || index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={cn(
                                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                selectedImageIndex === index
                                  ? "border-amber-500"
                                  : "border-transparent hover:border-gray-300"
                              )}
                            >
                              <Image
                                src={image.url}
                                alt={`${product.name} - ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col space-y-4">
                      {/* Brand & Name */}
                      <div>
                        <p className="text-sm text-amber-600 font-medium uppercase tracking-wide">
                          {product.brand}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                          {product.name}
                        </h2>
                      </div>

                      {/* Rating & Reviews */}
                      {product.reviews && product.reviews.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i <
                                    Math.round(
                                      product.reviews &&
                                        product.reviews.length > 0
                                        ? product.reviews.reduce(
                                            (sum, r) => sum + r.rating,
                                            0
                                          ) / product.reviews.length
                                        : 0
                                    )
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({product.reviews.length} reviews)
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-3">
                        {product.discountPrice ? (
                          <>
                            <span className="text-3xl font-bold text-gray-900">
                              ₹{Number(product.discountPrice).toFixed(2)}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                              ₹{Number(product.price).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-3xl font-bold text-gray-900">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {product.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      {/* Specifications */}
                      <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Frame Shape</p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.frameShape}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Material</p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.frameMaterial}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Color</p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.frameColor}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.gender}
                          </p>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center gap-2">
                        {product.stock > 0 ? (
                          <>
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              In Stock ({product.stock} available)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-red-600">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setQuantity(Math.max(1, quantity - 1))
                            }
                            disabled={quantity <= 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="text-lg font-semibold w-12 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(Math.min(product.stock, quantity + 1))
                            }
                            disabled={quantity >= product.stock}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleAddToCart}
                          disabled={product.stock === 0 || isAddingToCart}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          {isAddingToCart ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-5 h-5" />
                          )}
                          Add to Cart
                        </Button>
                        <button
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:text-amber-500 transition-colors"
                          aria-label="Add to wishlist"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* View Full Details Link */}
                      <Link
                        href={`/products/${product.id}`}
                        onClick={onClose}
                        className="text-center text-sm text-amber-600 hover:text-amber-700 font-medium underline"
                      >
                        View Full Product Details
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
