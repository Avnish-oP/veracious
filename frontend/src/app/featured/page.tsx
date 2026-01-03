"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFeaturedProducts, useProducts } from "@/hooks/useProducts";
import { ProductListingLayout } from "@/components/products/ProductListingLayout";
import { Button } from "@/components/ui/form-components";
import { Loader2, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";


function FeaturedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 12;

  // Fetch featured products for the grid (Paginated)
  const { 
    data: featuredData, 
    isLoading: isFeaturedLoading, 
    error: featuredError 
  } = useFeaturedProducts({ page, limit });

  // Fetch 'Spotlight' product (ADMIN CONTROLLED via 'spotlight' tag)
  const { 
    data: spotlightData, 
    // isLoading: isSpotlightLoading 
  } = useProducts({ search: "spotlight", limit: 1 });

  const products = featuredData?.products || [];
  const totalPages = featuredData?.totalPages || 1;
  const spotlightProduct = spotlightData?.products?.[0];

  const handlePageChange = (newPage: number) => {
    router.push(`/featured?page=${newPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isFeaturedLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
           <div className="flex flex-col items-center gap-4 text-gray-400">
             <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
             <p>Curating collection...</p>
           </div>
        </div>
      </div>
    );
  }

  if (featuredError) {
    return (
       <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
          <p className="text-red-500 font-medium mb-2">Unable to load featured products</p>
          <button 
             onClick={() => window.location.reload()}
             className="text-amber-600 hover:text-amber-700 font-semibold underline"
          >
             Try Again
          </button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      
      {/* Spotlight Product - Controlled by Admin 'spotlight' tag */}
      {spotlightProduct && (
        <section className="py-12 bg-gray-50 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 overflow-hidden relative border border-gray-100">
                
                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                   <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100"
                   >
                      <Image 
                        src={spotlightProduct.image || spotlightProduct.images?.[0]?.url || "/placeholder.png"} 
                        alt={spotlightProduct.name}
                        fill
                        className="object-cover"
                      />
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="space-y-6"
                   >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">
                         <Star className="w-3.5 h-3.5 fill-current" />
                         <span>Editor&apos;s Choice</span>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif">
                        {spotlightProduct.name}
                      </h2>
                      
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {spotlightProduct.description || "Experience the pinnacle of craftsmanship and style. This featured piece embodies the essence of modern elegance."}
                      </p>

                      <div className="flex items-end gap-4">
                         <span className="text-3xl font-bold text-gray-900">
                           ₹{spotlightProduct.discountPrice || spotlightProduct.price}
                         </span>
                         {spotlightProduct.discountPrice && (
                            <span className="text-xl text-gray-400 line-through mb-1">
                               ₹{spotlightProduct.price}
                            </span>
                         )}
                      </div>

                      <div className="pt-4">
                         <Link href={`/products/${spotlightProduct.id}`}>
                            <Button size="lg" className="bg-gray-900 text-white hover:bg-black rounded-xl px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                               Shop This Style <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                         </Link>
                      </div>
                   </motion.div>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* Main Collection Grid */}
      <ProductListingLayout
          title="Featured Collection"
          subtitle="Handpicked styles for the season"
          products={products}
          totalProducts={featuredData?.total || 0}
          currentPage={page}
          itemsPerPage={limit}
          totalPages={totalPages}
          loading={isFeaturedLoading}
          error={featuredError}
          activeFilters={{ page, limit, filter: 'featured' }}
          onFilterChange={(f) => {
              if (f.page) handlePageChange(f.page);
          }}
          onPageChange={handlePageChange}
          onAddToCart={() => {}} // TODO
          onQuickView={() => {}} // TODO
          // Sidebar now enabled by default
      />
    </div>
  );
}

export default function FeaturedPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 flex items-center justify-center">
         <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
       </div>
    }>
      <FeaturedContent />
    </Suspense>
  );
}
