import React from "react";

export const ProductSkeleton = () => {
  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-300">/</span>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-300">/</span>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right: Details Skeleton */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Price Box */}
            <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
              <div className="flex items-baseline gap-4">
                <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-full h-24 bg-gray-50 rounded-lg animate-pulse" />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4 h-14">
                <div className="flex-1 bg-gray-200 rounded-xl animate-pulse" />
                <div className="w-14 bg-gray-200 rounded-xl animate-pulse" />
              </div>
              <div className="w-full h-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>

             {/* Features */}
             <div className="grid grid-cols-3 gap-4 pt-6">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
