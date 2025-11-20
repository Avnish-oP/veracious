"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trash2,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Address } from "@/types/orderTypes";
import { createOrder } from "@/utils/checkoutApi";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    getCartSummary,
    clearCart,
    applyCouponToCart,
    removeCoupon,
    appliedCoupon,
    couponApplying,
  } = useCartStore();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  // Address form state
  const [address, setAddress] = useState<Address>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
  });

  const cartSummary = getCartSummary();

  // Shipping and tax calculations
  const itemsTotal = Math.max(
    0,
    cartSummary.subtotalAfterDiscount - cartSummary.couponDiscount
  );
  const SHIPPING_COST = itemsTotal > 1000 ? 0 : 50; // Free shipping above ₹1000
  const GST_RATE = 18; // 18% GST
  const gstAmount = (itemsTotal * GST_RATE) / 100;
  const finalTotal = itemsTotal + SHIPPING_COST + gstAmount;

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
    }

    // Redirect if not logged in
    if (!user) {
      toast.error("Please login to continue");
      router.push("/auth/login");
    }
  }, [cart, user, router]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      await applyCouponToCart(couponInput.trim().toUpperCase());
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
    toast.success("Coupon removed");
  };

  const handleProceedToPayment = async () => {
    // Validate address
    if (
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.postal ||
      !address.country
    ) {
      toast.error("Please fill in all required address fields");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Prepare order items
      const items = cart.items.map((item) => {
        const firstImage = item.product?.images?.[0];
        const imageUrl =
          typeof firstImage === "string" ? firstImage : firstImage?.url || "";

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.product?.price || 0),
          discountPrice: Number(item.product?.discountPrice || 0),
          name: item.product?.name || "",
          image: imageUrl,
        };
      });

      // Create order
      const orderResponse = await createOrder({
        items,
        couponCode: appliedCoupon?.code || undefined,
        shipping: SHIPPING_COST,
        gst: GST_RATE,
      });

      // Store order details and navigate to payment page
      sessionStorage.setItem("pendingOrder", JSON.stringify(orderResponse));
      sessionStorage.setItem("orderAddress", JSON.stringify(address));

      router.push("/payment");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !user) {
    return null;
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
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-amber-600" />
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your order and proceed to payment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Coupon */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.line1}
                    onChange={(e) =>
                      setAddress({ ...address, line1: e.target.value })
                    }
                    placeholder="Street address, P.O. box"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={address.line2}
                    onChange={(e) =>
                      setAddress({ ...address, line2: e.target.value })
                    }
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    placeholder="State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.postal}
                    onChange={(e) =>
                      setAddress({ ...address, postal: e.target.value })
                    }
                    placeholder="Postal code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) =>
                      setAddress({ ...address, country: e.target.value })
                    }
                    placeholder="Country"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </motion.div>

            {/* Coupon Code */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Tag className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Discount Coupon
                </h2>
              </div>

              {!appliedCoupon ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplying}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-green-700">
                        You saved ₹{cartSummary.couponDiscount.toFixed(2)}!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Items ({cart.items.length})
                </h2>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => {
                  const firstImage = item.product?.images?.[0];
                  const imageUrl =
                    typeof firstImage === "string"
                      ? firstImage
                      : firstImage?.url || "/placeholder.png";

                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹
                          {(
                            Number(
                              item.product?.discountPrice || item.product?.price
                            ) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>

                {(cartSummary.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Product savings</span>
                    <span>-₹{(cartSummary.discount ?? 0).toFixed(2)}</span>
                  </div>
                )}

                {cartSummary.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Coupon{" "}
                      {appliedCoupon ? `(${appliedCoupon.code})` : "savings"}
                    </span>
                    <span>-₹{cartSummary.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span>
                    {SHIPPING_COST === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `₹${SHIPPING_COST.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST ({GST_RATE}%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {SHIPPING_COST === 0 && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    You get FREE shipping on this order!
                  </p>
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure checkout with Razorpay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Multiple payment options available</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
