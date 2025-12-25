import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { Product } from "@/types/productTypes";

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Specifications" },
    { id: "reviews", label: `Reviews (${product.reviews?.length || 0})` },
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
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between py-3 border-b border-gray-50">
                         <dt className="text-gray-500">{item.label}</dt>
                         <dd className="font-semibold text-gray-900">{item.value || "N/A"}</dd>
                       </div>
                     ))}
                  </dl>
                </div>
                
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-2"/>
                     Lens & Usage
                  </h3>
                  <dl className="space-y-4">
                     {[
                       { label: "Lens Type", value: product.lensType },
                       { label: "Lens Color", value: product.lensColor },
                       { label: "Gender", value: product.gender },
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between py-3 border-b border-gray-50">
                         <dt className="text-gray-500">{item.label}</dt>
                         <dd className="font-semibold text-gray-900">{item.value || "N/A"}</dd>
                       </div>
                     ))}
                  </dl>
                </div>
              </div>

               {/* Additional Specifications Dynamic */}
               {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Additional Specifications</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-xl">
                          <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1 capitalize">{key.replace(/_/g, ' ')}</dt>
                          <dd className="font-semibold text-gray-900">{String(value)}</dd>
                        </div>
                      ))}
                    </div>
                  </div>
               )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Customer Feedback</h3>
                {/* Could add a 'Write a review' button here */}
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="grid gap-6">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-50 p-6 rounded-2xl space-y-3 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                              {(review.user?.name || "U").charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">
                                {review.user?.name || "Verified Customer"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString(undefined, {
                                   year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </p>
                           </div>
                        </div>
                        <div className="flex bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed pl-13">{review.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="mb-4 bg-white p-4 rounded-full w-fit mx-auto shadow-sm">
                     <Star className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-500">Be the first to share your thoughts on this product!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
