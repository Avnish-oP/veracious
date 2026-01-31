"use client";

import React, { useState } from "react";
import { Package, Calendar, ArrowRight, Loader2, Download, ShoppingBag, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOrdersQuery } from "@/hooks/useProfile";
import { downloadInvoice } from "@/utils/api";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  product?: {
    name: string;
    images?: Array<{ url: string } | string>;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  'DELIVERED': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Delivered' },
  'SHIPPED': { icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Shipped' },
  'PROCESSING': { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Processing' },
  'PENDING': { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Pending' },
  'CANCELLED': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Cancelled' },
  'PAYMENT_FAILED': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Payment Failed' },
};

export const OrderHistory: React.FC = () => {
  const router = useRouter();
  const { data: orders = [], isLoading: loading } = useOrdersQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setDownloadingId(orderId);
    try {
      await downloadInvoice(orderId);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const getProductImage = (item: OrderItem) => {
    if (item.product?.images && item.product.images.length > 0) {
      const img = item.product.images[0];
      return typeof img === "string" ? img : img?.url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Start shopping to see your order history here
        </p>
        <button
          onClick={() => router.push("/products")}
          className="px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium shadow-md"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-600" />
          Your Orders
        </h3>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>

      {orders.map((order: Order, index: number) => {
        const status = statusConfig[order.status] || statusConfig['PENDING'];
        const StatusIcon = status.icon;
        
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100 hover:border-amber-200 group"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <div className="p-5">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 ${status.bgColor} rounded-full`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span className={`text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0"
                    >
                      {getProductImage(item) ? (
                        <Image
                          src={getProductImage(item)!}
                          alt={item.product?.name || "Product"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        +{order.items.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{Number(order.totalAmount).toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {order.status !== 'PENDING' && order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED' && (
                    <button
                      onClick={(e) => handleDownloadInvoice(e, order.id)}
                      disabled={downloadingId === order.id}
                      className="p-2.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Download Invoice"
                    >
                      {downloadingId === order.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
