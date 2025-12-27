"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const params = useParams();
  // const router = useRouter();
  const orderId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-sm text-gray-500">
            Your order has been confirmed and will be processed soon
          </p>
        </motion.div>

        {/* Order ID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Order ID</span>
          </div>
          <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <p className="text-sm text-blue-900">
            <strong>What&apos;s next?</strong>
            <br />
            We&apos;ll send you a confirmation email with your order details and
            tracking information once your order has been shipped.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/products"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/"
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
