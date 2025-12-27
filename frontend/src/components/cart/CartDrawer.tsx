"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useCartStore } from "@/store/useCartStore";
// import { useUserStore } from "@/store/useUserStore";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/form-components";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user } = useUser();
  const {
    cart,
    isLoading: loading,
    updateCartItem,
    removeFromCart,
    getCartSummary,
    // getTotalItems,
  } = useCart();

  const cartSummary = getCartSummary();
  // const totalItems = getTotalItems();

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
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
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
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to proceed with checkout");
      onClose();
      router.push("/auth/login");
      return;
    }

    onClose();
    router.push("/checkout");
  };

  const handleViewCart = () => {
    onClose();
    router.push("/cart");
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Shopping Cart
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-100 rounded-lg animate-pulse"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start adding some items to your cart
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      onClose();
                      router.push("/products");
                    }}
                  >
                    Shop Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product?.name || "Product"}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item.product?.name || "Product"}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.product?.brand || ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-amber-600">
                            ₹
                            {(
                              (Number(item.product?.discountPrice) ||
                                Number(item.product?.price) ||
                                0) * item.quantity
                            ).toFixed(2)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleDecreaseQuantity(
                                  item.productId,
                                  item.quantity
                                )
                              }
                              className="p-1 rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                              disabled={loading}
                            >
                              <Minus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span className="w-8 text-center text-black text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleIncreaseQuantity(
                                  item.productId,
                                  item.quantity
                                )
                              }
                              className="p-1 rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                              disabled={loading}
                            >
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="p-1 rounded-md hover:bg-red-50 transition-colors ml-2"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Summary */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{cartSummary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {(cartSummary.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Product savings</span>
                      <span>-₹{(cartSummary.discount ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  {cartSummary.couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Coupon savings</span>
                      <span>-₹{cartSummary.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-amber-600">
                        ₹{cartSummary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleViewCart}
                    className="w-full"
                  >
                    View Full Cart
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
