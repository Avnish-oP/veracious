"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Package, 
  ArrowLeft, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  MapPin, 
  Download, 
  Loader2,
  CreditCard,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderById, downloadInvoice } from "@/utils/api";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number | string;
  product?: {
    id: string;
    name: string;
    brand?: string;
    images?: Array<{ url: string } | string>;
  };
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  totalAmount: number | string;
  subtotal?: number | string;
  tax?: number | string;
  discount?: number | string;
  shippingCost?: number | string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string; description: string }> = {
  'DELIVERED': { 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 border-green-200', 
    label: 'Delivered',
    description: 'Your order has been delivered successfully'
  },
  'SHIPPED': { 
    icon: Truck, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 border-blue-200', 
    label: 'Shipped',
    description: 'Your order is on its way'
  },
  'PROCESSING': { 
    icon: Clock, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 border-amber-200', 
    label: 'Processing',
    description: 'Your order is being prepared'
  },
  'PENDING': { 
    icon: Clock, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-50 border-gray-200', 
    label: 'Pending',
    description: 'Waiting for confirmation'
  },
  'CANCELLED': { 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50 border-red-200', 
    label: 'Cancelled',
    description: 'This order has been cancelled'
  },
  'PAYMENT_FAILED': { 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50 border-red-200', 
    label: 'Payment Failed',
    description: 'Payment was not successful'
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [downloading, setDownloading] = useState(false);

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
  });

  // Handle different response structures
  const order = (orderData as { order?: Order })?.order || orderData as Order | undefined;

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      await downloadInvoice(orderId);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const getProductImage = (item: OrderItem) => {
    if (item.product?.images && item.product.images.length > 0) {
      const img = item.product.images[0];
      return typeof img === "string" ? img : img?.url;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find this order</p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig['PENDING'];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Order #{orderId.slice(0, 8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            {order.status !== 'PENDING' && order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED' && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-colors font-medium text-gray-700"
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                Download Invoice
              </button>
            )}
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border-2 ${status.bgColor} mb-6`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-white rounded-xl shadow-sm`}>
              <StatusIcon className={`w-8 h-8 ${status.color}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${status.color}`}>{status.label}</h2>
              <p className="text-gray-600 text-sm">{status.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors"
                >
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 hover:opacity-90 transition-opacity"
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
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-medium text-gray-900 hover:text-amber-600 transition-colors line-clamp-2"
                    >
                      {item.product?.name || "Product"}
                    </Link>
                    {item.product?.brand && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.product.brand}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <span className="font-bold text-gray-900">
                        ₹{(Number(item.price) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Order Summary & Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Order Summary
              </h3>
              <div className="space-y-3">
                {order.subtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{Number(order.subtotal).toFixed(0)}</span>
                  </div>
                )}
                {order.discount && Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-600">-₹{Number(order.discount).toFixed(0)}</span>
                  </div>
                )}
                {order.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (GST)</span>
                    <span className="font-medium text-gray-900">₹{Number(order.tax).toFixed(0)}</span>
                  </div>
                )}
                {order.shippingCost && Number(order.shippingCost) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium text-gray-900">₹{Number(order.shippingCost).toFixed(0)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-amber-600">
                      ₹{Number(order.totalAmount).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Shipping Address
                </h3>
                <div className="text-gray-600 text-sm space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            {order.paymentMethod && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  Payment
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Method</span>
                  <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                </div>
                {order.paymentStatus && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-sm">Status</span>
                    <span className={`font-medium capitalize ${
                      order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6 text-center"
        >
          <p className="text-gray-600 mb-3">Need help with your order?</p>
          <Link
            href="/contact"
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
          >
            Contact Support →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
