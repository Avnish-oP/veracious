"use client";

import React, { useState } from "react";
import { Package, Calendar, ArrowRight, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOrdersQuery } from "@/hooks/useProfile";
import { downloadInvoice } from "@/utils/api";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}

export const OrderHistory: React.FC = () => {
  const router = useRouter();
  const { data: orders = [], isLoading: loading } = useOrdersQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent navigation to details
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t made any purchases yet.</p>
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Order, index: number) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-transparent hover:border-amber-200"
          onClick={() => router.push(`/orders/${order.id}`)}
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'PENDING' && order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED' && (
                      <button
                        onClick={(e) => handleDownloadInvoice(e, order.id)}
                        disabled={downloadingId === order.id}
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                        title="Download Invoice"
                      >
                         {downloadingId === order.id ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                         ) : (
                           <Download className="w-5 h-5" />
                         )}
                      </button>
                    )}
                    <button className="p-2">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
