"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { Product } from "@/types/productTypes";

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
}) => {
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Specifications" },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8"
    >
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 sm:gap-8 border-b border-gray-100 mb-8 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-4 px-2 font-semibold text-sm sm:text-base whitespace-nowrap transition-all relative",
              activeTab === tab.id
                ? "text-amber-600"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="prose prose-amber max-w-none"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this product</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description || "No description available for this product."}
              </p>
            </motion.div>
          )}

          {activeTab === "specs" && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full mr-2"/>
                    Frame Details
                  </h3>
                  <dl className="space-y-4">
                     {[
                       { label: "Frame Shape", value: product.frameShape },
                       { label: "Frame Material", value: product.frameMaterial },
                       { label: "Frame Color", value: product.frameColor },
                     ].filter(item => item.value).map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <dt className="text-gray-500 text-sm">{item.label}</dt>
                        <dd className="font-medium text-gray-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="space-y-6">
                   <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-amber-500 rounded-full mr-2"/>
                     Lens Details
                   </h3>
                   <dl className="space-y-4">
                      {[
                        { label: "Lens Type", value: product.lensType },
                        { label: "Lens Color", value: product.lensColor },
                      ].filter(item => item.value).map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <dt className="text-gray-500 text-sm">{item.label}</dt>
                          <dd className="font-medium text-gray-900">{item.value}</dd>
                        </div>
                      ))}
                   </dl>
                   <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 pt-4">
                     <span className="w-1.5 h-6 bg-amber-500 rounded-full mr-2"/>
                     Additional Info
                   </h3>
                   <dl className="space-y-4">
                      {[
                        { label: "Gender", value: product.gender },
                        { label: "Brand", value: product.brand },
                        { label: "SKU", value: product.sku },
                      ].filter(item => item.value).map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <dt className="text-gray-500 text-sm">{item.label}</dt>
                          <dd className="font-medium text-gray-900">{item.value}</dd>
                        </div>
                      ))}
                   </dl>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
