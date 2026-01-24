"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Trash2, ArrowLeft, PackageX } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const router = useRouter();
  const { items, isLoading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemoveFromWishlist = (productId: string) => {
    try {
      toggleWishlist(productId);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const item of items) {
        await addToCart(item.productId, 1);
      }
    } catch (error) {
      console.error("Failed to add all to cart:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-amber-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-10 h-10 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-2">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>

            {items.length > 0 && (
              <Button
                onClick={handleAddAllToCart}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add All to Cart
              </Button>
            )}
          </div>
        </motion.div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <PackageX className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start adding products you love to your wishlist!
            </p>
            <Button
              onClick={() => router.push("/products")}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Browse Products
            </Button>
          </motion.div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(items.filter(item => item.product) as (typeof items[number] & { product: NonNullable<typeof items[number]['product']> })[]).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  <Image
                    src={item.product.image || "/placeholder-product.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Remove Button */}
                  <motion.button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </motion.button>

                  {/* Discount Badge */}
                  {item.product.discountPrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      -
                      {Math.round(
                        ((item.product.price - item.product.discountPrice) /
                          item.product.price) *
                          100
                      )}
                      %
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {item.product.brand}
                    </p>
                    <h3
                      className="font-semibold text-gray-900 line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer"
                      onClick={() => router.push(`/products/${item.productId}`)}
                    >
                      {item.product.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    {item.product.discountPrice ? (
                      <>
                        <span className="text-lg font-bold text-gray-900">
                          ₹
                          {typeof item.product.discountPrice === "number"
                            ? item.product.discountPrice.toFixed(2)
                            : item.product.discountPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹
                          {typeof item.product.price === "number"
                            ? item.product.price.toFixed(2)
                            : item.product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ₹
                        {typeof item.product.price === "number"
                          ? item.product.price.toFixed(2)
                          : item.product.price}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span
                      className={cn(
                        "font-medium",
                        item.product.stock > 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {item.product.stock > 0
                        ? `${item.product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAddToCart(item.productId)}
                      disabled={item.product.stock === 0}
                      className={cn(
                        "flex-1 text-sm",
                        item.product.stock > 0
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => router.push(`/products/${item.productId}`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
