"use client";

import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// import { useCartStore } from "@/store/useCartStore";
// import { useUserStore } from "@/store/useUserStore";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/form-components";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useCouponsByOrderValue } from "@/hooks/useCoupons";
import { ItemConfiguration } from "@/types/cartTypes";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Package,
  Loader2,
  Tag,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const {
    cart,
    isLoading: loading,
    updateCartItem,
    removeFromCart,
    getCartSummary,
    getTotalItems,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    couponApplying,
  } = useCart();

  const cartSummary = getCartSummary();
  const totalItems = getTotalItems();
  const [couponInput, setCouponInput] = useState("");
  const { data: suggestedCouponsData, isLoading: suggestedCouponsLoading } =
    useCouponsByOrderValue(cartSummary.subtotalAfterDiscount);
  const suggestedCoupons = suggestedCouponsData?.coupons ?? [];
  const recommendedCoupons = suggestedCoupons.slice(0, 3);
  const hasRecommendedCoupons = recommendedCoupons.length > 0;

  const handleIncreaseQuantity = async (
    productId: string,
    currentQuantity: number,
  ) => {
    try {
      await updateCartItem(productId, currentQuantity + 1);
    } catch (error) {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Failed to update quantity");
    }
  };

  const handleDecreaseQuantity = async (
    productId: string,
    currentQuantity: number,
  ) => {
    try {
      if (currentQuantity <= 1) {
        await removeFromCart(productId);
        toast.success("Item removed from cart");
      } else {
        await updateCartItem(productId, currentQuantity - 1);
      }
    } catch (error) {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Failed to remove item");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      await applyCoupon(couponInput.trim().toUpperCase());
      toast.success("Coupon applied successfully");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    }
  };

  const handleSelectSuggestedCoupon = async (code: string) => {
    setCouponInput(code);
    try {
      await applyCoupon(code);
      toast.success(`${code} applied`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    }
  };

  const handleCouponRemoval = () => {
    removeCoupon();
    setCouponInput("");
    toast.success("Coupon removed");
  };

  const handleContinueShopping = () => {
    router.push("/products");
  };

  const handleCheckout = () => {
    // Wait for user loading to complete before checking auth
    if (userLoading) {
      toast.loading("Checking authentication...");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Please login to proceed with checkout");
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    // Proceed to checkout page
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-md h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-amber-600" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <button
              onClick={handleContinueShopping}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </button>
          </div>
        </motion.div>

        {/* Free Shipping Progress */}
        {cart && cart.items?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl"
          >
            {cartSummary.subtotalAfterDiscount < FREE_SHIPPING_THRESHOLD ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">
                      Add <span className="font-bold">₹{(FREE_SHIPPING_THRESHOLD - cartSummary.subtotalAfterDiscount).toFixed(0)}</span> more for FREE shipping!
                    </span>
                  </div>
                  <span className="text-sm text-emerald-600 font-medium">
                    {((cartSummary.subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (cartSummary.subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <Truck className="w-5 h-5" />
                <span>🎉 Congratulations! You&apos;ve unlocked FREE shipping on this order!</span>
              </div>
            )}
          </motion.div>
        )}

        {!cart || cart.items?.length === 0 ? (
          // Empty Cart State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-amber-100 rounded-full">
                <Package className="w-16 h-16 text-amber-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added anything to your cart yet. Start
              shopping to find amazing products!
            </p>
            <Button
              onClick={handleContinueShopping}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3"
            >
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id || `${item.productId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image - Clickable */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity group"
                      >
                        {item.product?.images?.[0] ? (
                          <Image
                            src={
                              typeof item.product.images[0] === "string"
                                ? item.product.images[0]
                                : item.product.images[0]?.url
                            }
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {item.product?.discountPrice && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            SALE
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.productId}`}
                              className="hover:text-amber-600 transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {item.product?.name || "Product"}
                              </h3>
                            </Link>
                            {item.product?.brand && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.product.brand}
                              </p>
                            )}

                            {/* Price */}
                            <div className="mt-2 flex flex-col gap-1">
                              <div className="flex items-baseline gap-2">
                                {item.product?.discountPrice ? (
                                  <>
                                    <span className="text-xl font-bold text-gray-900">
                                      ₹
                                      {Number(
                                        item.product.discountPrice,
                                      ).toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{Number(item.product.price).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xl font-bold text-gray-900">
                                    ₹
                                    {Number(item.product?.price || 0).toFixed(
                                      2,
                                    )}
                                  </span>
                                )}
                              </div>
                              {/* Lens Price Breakdown */}
                              {(() => {
                                const config = item.configuration as
                                  | ItemConfiguration
                                  | undefined;
                                return config?.lensPrice &&
                                  config.lensPrice > 0 ? (
                                  <div className="text-sm text-blue-600 font-medium">
                                    + ₹{Number(config.lensPrice).toFixed(2)} for{" "}
                                    {config.lensType || "Lens"}
                                  </div>
                                ) : null;
                              })()}
                              {/* Lens Details */}
                              {(() => {
                                const config = item.configuration as
                                  | ItemConfiguration
                                  | undefined;
                                return config?.prescriptionType ? (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {config.prescriptionType} •{" "}
                                    {config.lensType}
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Quantity Controls and Subtotal */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center bg-gray-100 rounded-lg">
                            <button
                              onClick={() =>
                                handleDecreaseQuantity(
                                  item.productId,
                                  item.quantity,
                                )
                              }
                              className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="px-3 py-2 font-semibold text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleIncreaseQuantity(
                                  item.productId,
                                  item.quantity,
                                )
                              }
                              className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Subtotal</p>
                            <p className="text-lg font-bold text-gray-900">
                              ₹
                              {(() => {
                                const config = item.configuration as
                                  | ItemConfiguration
                                  | undefined;
                                return (
                                  ((Number(item.product?.discountPrice) ||
                                    Number(item.product?.price) ||
                                    0) +
                                    Number(config?.lensPrice || 0)) *
                                  item.quantity
                                ).toFixed(0);
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-3">
                    <Tag className="w-4 h-4" />
                    Apply Coupon
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-white border border-green-200 rounded-lg p-3">
                      <div>
                        <p className="font-mono text-sm font-semibold text-green-700">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appliedCoupon.description ||
                            "Coupon applied successfully"}
                        </p>
                      </div>
                      <button
                        onClick={handleCouponRemoval}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) =>
                            setCouponInput(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2.5 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponApplying}
                          className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {couponApplying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Applying
                            </>
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>

                      {suggestedCouponsLoading && (
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Checking best coupons for you...
                        </p>
                      )}

                      {hasRecommendedCoupons && !suggestedCouponsLoading && (
                        <div>
                          <div className="flex items-center gap-2 text-xs uppercase font-semibold text-amber-700">
                            <Sparkles className="w-3.5 h-3.5" />
                            Recommended Coupons
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {recommendedCoupons.map((coupon) => (
                              <button
                                key={coupon.id}
                                onClick={() =>
                                  handleSelectSuggestedCoupon(coupon.code)
                                }
                                className="px-3 py-1.5 text-xs font-mono rounded-full border border-amber-300 text-amber-700 hover:bg-white"
                              >
                                {coupon.code}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium">
                      ₹{cartSummary.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {cartSummary.discount ? (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Product savings</span>
                      <span className="font-medium">
                        -₹{cartSummary.discount.toFixed(2)}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Items total</span>
                    <span className="font-medium">
                      ₹{cartSummary.subtotalAfterDiscount.toFixed(2)}
                    </span>
                  </div>

                  {cartSummary.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>
                        Coupon{" "}
                        {appliedCoupon ? `(${appliedCoupon.code})` : "Savings"}
                      </span>
                      <span className="font-medium">
                        -₹{cartSummary.couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {cartSummary.shipping === 0
                        ? "FREE"
                        : `₹${(cartSummary.shipping ?? 0).toFixed(2)}`}
                    </span>
                  </div> */}

                  {/* <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">
                      ₹{(cartSummary.tax ?? 0).toFixed(2)}
                    </span>
                  </div> */}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold text-gray-900">
                        Total{" "}
                        <span className="text-gray-500 text-sm">
                          (Without taxes)
                        </span>
                      </span>
                      <span className="text-2xl font-bold text-amber-600">
                        ₹{cartSummary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full mt-3 text-amber-600 hover:text-amber-700 font-medium py-2 transition-colors"
                >
                  Continue Shopping
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Free shipping over ₹999</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>30-day returns</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
