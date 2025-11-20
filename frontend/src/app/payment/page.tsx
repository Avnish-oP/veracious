"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import {
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { loadRazorpayScript, verifyPayment } from "@/utils/checkoutApi";
import { CreateOrderResponse, RazorpayOptions } from "@/types/orderTypes";

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { clearCart } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");

  useEffect(() => {
    // Load order data from session storage
    const pendingOrder = sessionStorage.getItem("pendingOrder");

    if (!pendingOrder) {
      toast.error("No pending order found");
      router.push("/cart");
      return;
    }

    if (!user) {
      toast.error("Please login to continue");
      router.push("/auth/login");
      return;
    }

    try {
      const order: CreateOrderResponse = JSON.parse(pendingOrder);
      setOrderData(order);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing order data:", error);
      toast.error("Invalid order data");
      router.push("/cart");
    }
  }, [user, router]);

  const handlePayment = async () => {
    if (!orderData || !user) return;

    setProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: orderData.razorpay.key_id,
        amount: orderData.razorpay.amount,
        currency: orderData.razorpay.currency,
        name: "Veracious",
        description: "Order Payment",
        order_id: orderData.razorpay.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyPayment({
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              setPaymentStatus("success");
              toast.success("Payment successful!");

              // Clear cart after successful payment
              clearCart();

              // Clear session storage
              sessionStorage.removeItem("pendingOrder");
              sessionStorage.removeItem("orderAddress");

              // Redirect to success page after 2 seconds
              setTimeout(() => {
                router.push(`/orders/${orderData.orderId}`);
              }, 2000);
            } else {
              setPaymentStatus("failed");
              toast.error("Payment verification failed");
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            setPaymentStatus("failed");
            toast.error(error.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phoneNumber || "",
        },
        theme: {
          color: "#D97706", // Amber-600
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  const handleBackToCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {paymentStatus === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <CreditCard className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Complete Payment
              </h1>
              <p className="text-gray-600">
                Secure payment powered by Razorpay
              </p>
            </div>

            {/* Order Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Order ID</span>
                  <span className="font-mono text-sm">
                    {orderData.orderId.slice(0, 8)}...
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Amount</span>
                  <span className="font-semibold">
                    ₹{(orderData.razorpay.amount / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Currency</span>
                  <span>{orderData.razorpay.currency}</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-amber-600">
                      ₹{(orderData.razorpay.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Methods Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Payment Methods
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Credit Card</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Debit Card</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Net Banking</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">UPI</span>
                </div>
              </div>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">
                    Secure Payment
                  </h4>
                  <p className="text-sm text-green-700">
                    Your payment information is encrypted and secure. We use
                    industry-standard security measures to protect your data.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBackToCheckout}
                disabled={processing}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Checkout
              </button>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {paymentStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed. Redirecting...
            </p>
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          </motion.div>
        )}

        {/* Failed State */}
        {paymentStatus === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-12 h-12 text-red-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-8">
              Something went wrong with your payment. Please try again.
            </p>
            <button
              onClick={() => setPaymentStatus("pending")}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
