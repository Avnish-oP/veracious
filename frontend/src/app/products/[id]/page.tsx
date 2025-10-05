"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  Check,
  Truck,
  RefreshCw,
  Shield,
  Loader2,
  ChevronLeft,
  ArrowLeft,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useProductDetail } from "@/hooks/useProducts";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { toast } from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data, isLoading, error } = useProductDetail(productId);
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews"
  >("description");

  const product = data?.product;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
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

  const avgRating = product?.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Product not found</p>
          <Button onClick={() => router.push("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600 mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="hover:text-amber-600 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => router.push("/products")}
            className="hover:text-amber-600 transition-colors"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </motion.div>

        {/* Product Info Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
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
                    priority
                  />

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.isFeatured && (
                      <span className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        Featured
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <span className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        Save {discountPercentage}%
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <ShoppingCart className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      selectedImageIndex === index
                        ? "border-amber-500 ring-2 ring-amber-200"
                        : "border-gray-200 hover:border-amber-300"
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
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Brand & Name */}
            <div>
              <p className="text-sm text-amber-600 font-semibold uppercase tracking-wider mb-2">
                {product.brand}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rating & Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.round(avgRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {avgRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <div className="flex items-baseline gap-4 mb-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      ${Number(product.discountPrice).toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-500 line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                      {discountPercentage}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    ${Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Coupons */}
              {product.applicableCoupons &&
                product.applicableCoupons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-600" />
                      Available Coupons:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.applicableCoupons.slice(0, 2).map((coupon) => (
                        <span
                          key={coupon.id}
                          className="px-3 py-1 bg-white border border-amber-300 text-amber-700 text-xs font-mono rounded"
                        >
                          {coupon.code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              {product.stock > 0 ? (
                <>
                  <Check className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-700">In Stock</p>
                    <p className="text-sm text-green-600">
                      {product.stock} units available
                    </p>
                  </div>
                </>
              ) : (
                <p className="font-semibold text-red-600">Out of Stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="px-6 text-xl font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Max: {product.stock} units
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <ShoppingCart className="w-6 h-6" />
                )}
                Add to Cart
              </Button>
              <button
                className="p-4 border-2 border-amber-500 rounded-xl hover:bg-amber-50 text-amber-600 transition-all"
                aria-label="Add to wishlist"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">
                  Easy Returns
                </p>
                <p className="text-xs text-gray-500">30-day policy</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">
                  Secure Payment
                </p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Tab Headers */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {["description", "specs", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={cn(
                  "pb-4 px-2 font-semibold transition-all capitalize",
                  activeTab === tab
                    ? "text-amber-600 border-b-2 border-amber-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab}
                {tab === "reviews" &&
                  product.reviews &&
                  ` (${product.reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description ||
                  "No description available for this product."}
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Frame Details
                </h3>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Frame Shape</span>
                  <span className="font-semibold text-gray-900">
                    {product.frameShape}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Frame Material</span>
                  <span className="font-semibold text-gray-900">
                    {product.frameMaterial}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Frame Color</span>
                  <span className="font-semibold text-gray-900">
                    {product.frameColor}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Lens Details
                </h3>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Lens Type</span>
                  <span className="font-semibold text-gray-900">
                    {product.lensType}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Lens Color</span>
                  <span className="font-semibold text-gray-900">
                    {product.lensColor}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Gender</span>
                  <span className="font-semibold text-gray-900">
                    {product.gender}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-6 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.user.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
