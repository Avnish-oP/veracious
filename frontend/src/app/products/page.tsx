"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Added useRouter
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import { Product, ProductFilters } from "@/types/productTypes";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { ProductListingLayout } from "@/components/products/ProductListingLayout";



function ProductsContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const { addToCart, isUserLoading } = useCart();

  const filterParam = searchParams.get("filter") || "all";
  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const genderParam = searchParams.get("gender");
  const sortParam = searchParams.get("sort");
  const searchParam = searchParams.get("search");
  const pageParam = Number(searchParams.get("page")) || 1;

  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);

  const activeFilters: ProductFilters = {
    page: pageParam,
    limit: 12, // Default limit
    filter: filterParam,
    category: categoryParam || undefined,
    brand: brandParam || undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    gender: genderParam || undefined,
    sort: (sortParam as ProductFilters['sort']) || undefined,
    search: searchParam || undefined,
  };

  const { data: productsData, isLoading, error } = useProducts(activeFilters);

  const updateUrl = (filters: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters.filter) params.set("filter", filters.filter as string); 
    
    // We expect "filter" to be "all", "featured", etc.
    // If we have explicit filters, we might want to keep the base "filter=all" or whatever was there.
    
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    
    router.push(`/products?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: ProductFilters) => {
      // Merge logic if needed, but usually we just want to update URL and let effect re-trigger
      // However since we are driving state from URL, we just push new URL.
      // We need to merge with existing activeFilters to ensure we don't lose other params not passed. (Wait, newFilters should usually be partial or complete?)
      // The Layout will pass merged filters usually, or partials.
      // Let's assume onFilterChange provides the complete Desired State.
      
      // Actually, standard pattern:
      updateUrl(newFilters);
      
      // Scroll to top if page changed or filters applied
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = async (product: Product) => {
    if (isUserLoading) {
      toast.loading("Loading...", { duration: 1000 });
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const getPageTitle = () => {
       if (activeFilters.search) return `Search Results for "${activeFilters.search}"`;
       if (activeFilters.category) {
           // Try to find category name from ID if possible, or just capitalize
           // Since we don't have the list here easily unless we fetch it or pass it, we might just use the ID comfortably or rely on the fact that usually ID=Name in some simple apps, 
           // but better: "Category: [ID]" for now or just the ID capitalizing first letter.
           // Actually, the API returns products, maybe we can't easily get the pretty name without a lookup. 
           // Let's just capitalize the ID/Slug for now as a fallback.
           return activeFilters.category.charAt(0).toUpperCase() + activeFilters.category.slice(1).replace(/-/g, ' '); 
       }
       if (activeFilters.brand) return activeFilters.brand;
       if (activeFilters.filter === "featured") return "Featured Products";
       if (activeFilters.filter === "trending") return "Trending Products";
       if (activeFilters.gender) return `${activeFilters.gender.charAt(0).toUpperCase() + activeFilters.gender.slice(1).toLowerCase()}'s Collection`;
       
       return "All Products";
  };
  
  const getPageSubtitle = () => {
       // User requested to remove subtitle.
       return undefined;
  };

  return (
    <>
      <ProductListingLayout
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
        products={productsData?.products || []}
        totalProducts={productsData?.total || 0}
        currentPage={productsData?.page || 1}
        itemsPerPage={productsData?.limit || 12}
        totalPages={productsData?.totalPages || 1}
        loading={isLoading}
        error={error}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onPageChange={(page) => handleFilterChange({ ...activeFilters, page })}
        onAddToCart={handleAddToCart}
        onQuickView={(p) => setQuickViewProductId(p.id)}
      />

      {quickViewProductId && (
        <QuickViewModal
          isOpen={!!quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          productId={quickViewProductId}
        />
      )}
    </>
  );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}
