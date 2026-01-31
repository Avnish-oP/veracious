"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Truck, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/form-components";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 999;

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user } = useUser();
  const {
    cart,
    isLoading: loading,
    updateCartItem,
    removeFromCart,
    getCartSummary,
    getTotalItems,
  } = useCart();

  const cartSummary = getCartSummary();
  const totalItems = getTotalItems();
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSummary.subtotalAfterDiscount);
  const freeShippingProgress = Math.min(100, (cartSummary.subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleIncreaseQuantity = async (
    productId: string,
    currentQuantity: number
  ) => {
    try {
      await updateCartItem(productId, currentQuantity + 1);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecreaseQuantity = async (
    productId: string,
    currentQuantity: number
  ) => {
    try {
      if (currentQuantity <= 1) {
        await removeFromCart(productId);
        toast.success("Item removed from cart");
      } else {
        await updateCartItem(productId, currentQuantity - 1);
      }
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to proceed with checkout");
      onClose();
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    onClose();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
  };

  // Get product image URL helper
  const getProductImage = (item: NonNullable<typeof cart>["items"][0]) => {
    if (item.product?.images && item.product.images.length > 0) {
      const img = item.product.images[0];
      return typeof img === "string" ? img : img?.url;
    }
    return item.product?.image;
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Shopping Cart
                  </h2>
                  <p className="text-xs text-gray-500">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-full transition-all hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cart && cart.items.length > 0 && (
              <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                {amountForFreeShipping > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <Truck className="w-4 h-4" />
                        <span>Add <span className="font-bold">₹{amountForFreeShipping.toFixed(0)}</span> for free shipping</span>
                      </div>
                    </div>
                    <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${freeShippingProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                    <Truck className="w-4 h-4" />
                    <span>🎉 You&apos;ve unlocked FREE shipping!</span>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-2xl animate-pulse"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-6">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-[250px]">
                    Discover amazing products and start building your collection!
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      onClose();
                      router.push("/products");
                    }}
                    className="bg-amber-500 hover:bg-amber-600 shadow-md"
                  >
                    Start Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {cart.items.map((item, index) => {
                      const unitPrice = Number(item.product?.discountPrice) || Number(item.product?.price) || 0;
                      const hasDiscount = item.product?.discountPrice && Number(item.product.discountPrice) < Number(item.product.price);
                      
                      return (
                        <motion.div
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-amber-200 transition-all duration-300"
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <Link
                              href={`/products/${item.productId}`}
                              onClick={onClose}
                              className="relative w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                            >
                              {getProductImage(item) ? (
                                <Image
                                  src={getProductImage(item)!}
                                  alt={item.product?.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                              {hasDiscount && (
                                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  SALE
                                </div>
                              )}
                            </Link>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <Link 
                                  href={`/products/${item.productId}`}
                                  onClick={onClose}
                                  className="hover:text-amber-600 transition-colors"
                                >
                                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                                    {item.product?.name || "Product"}
                                  </h3>
                                </Link>
                                <button
                                  onClick={() => handleRemoveItem(item.productId)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                  disabled={loading}
                                >
                                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                                </button>
                              </div>
                              
                              {item.product?.brand && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.product.brand}
                                </p>
                              )}

                              {/* Price and Quantity */}
                              <div className="flex items-end justify-between mt-3">
                                <div>
                                  <p className="text-lg font-bold text-gray-900">
                                    ₹{(unitPrice * item.quantity).toFixed(0)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-gray-400">
                                      ₹{unitPrice.toFixed(0)} × {item.quantity}
                                    </p>
                                  )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                                  <button
                                    onClick={() =>
                                      handleDecreaseQuantity(
                                        item.productId,
                                        item.quantity
                                      )
                                    }
                                    className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors"
                                    disabled={loading}
                                  >
                                    <Minus className="w-3.5 h-3.5 text-gray-600" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleIncreaseQuantity(
                                        item.productId,
                                        item.quantity
                                      )
                                    }
                                    className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors"
                                    disabled={loading}
                                  >
                                    <Plus className="w-3.5 h-3.5 text-gray-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer with Summary */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
                {/* Summary */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-gray-900">
                      ₹{cartSummary.subtotal.toFixed(0)}
                    </span>
                  </div>
                  {(cartSummary.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Savings</span>
                      <span className="font-medium">-₹{(cartSummary.discount ?? 0).toFixed(0)}</span>
                    </div>
                  )}
                  {cartSummary.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Coupon discount</span>
                      <span className="font-medium">-₹{cartSummary.couponDiscount.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Total and Actions */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      ₹{cartSummary.total.toFixed(0)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCheckout}
                    className="w-full bg-amber-500 hover:bg-amber-600 shadow-md py-3.5 text-base font-bold"
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <button
                    onClick={handleViewCart}
                    className="w-full text-center text-sm text-gray-500 hover:text-amber-600 font-medium py-2 transition-colors"
                  >
                    View Full Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
