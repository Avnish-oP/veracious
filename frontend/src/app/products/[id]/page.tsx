"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import { useProductDetail } from "@/hooks/useProducts";
import { Button } from "@/components/ui/form-components";
import { ProductSkeleton } from "./ProductSkeleton";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductTabs } from "./ProductTabs";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data, isLoading, error } = useProductDetail(productId);
  const product = data?.product;

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-full w-fit mx-auto">
             <ArrowLeft className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the product you're looking for. It might have been removed or doesn't exist.
          </p>
          <Button onClick={() => router.push("/products")} className="w-full">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((Number(product.price) - Number(product.discountPrice)) /
          Number(product.price)) *
          100
      )
    : 0;

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Clean & Modern */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide"
        >
          <button
            onClick={() => router.push("/")}
            className="hover:text-amber-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <button
            onClick={() => router.push("/products")}
            className="hover:text-amber-600 transition-colors"
          >
            Products
          </button>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs block">
            {product.name}
          </span>
        </motion.nav>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Left: Image Gallery */}
          <div className="relative">
            <ProductImageGallery
              product={product}
              discountPercentage={discountPercentage}
            />
          </div>

          {/* Right: Info & Actions */}
          <div>
            <ProductInfo
              product={product}
              discountPercentage={discountPercentage}
              avgRating={avgRating}
            />
          </div>
        </div>

        {/* Tabs Section (Description, Specs, Reviews) */}
        <ProductTabs product={product} />
      </div>
    </div>
  );
}
