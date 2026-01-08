"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import {
  useProducts,
  useFeaturedProducts,
  useTrendingProducts,
} from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { NewArrivals } from "@/components/home/NewArrivals";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CategorySection } from "@/components/home/CategorySection";
import { PromoBanner } from "@/components/home/PromoBanner";

export default function Home() {
  const router = useRouter();

  // Fetch all products (page 1)
  const { data: allProductsData, isLoading: allLoading } = useProducts({
    page: 1,
    limit: 8,
    category: "sunglasses",
  });

  // Fetch New Arrivals (limit 8) - useProducts sorts by createdAt desc by default
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useProducts({
    page: 1,
    limit: 8,
    category: "sunglasses",
  });

  const { recentlyViewed } = useRecentlyViewed();

  // Fetch featured products (page 1)
  const { data: featuredProductsData, isLoading: featuredLoading } =
    useFeaturedProducts({ page: 1, limit: 8, category: "sunglasses" });

  // Fetch trending products (page 1)
  const { data: trendingProductsData, isLoading: trendingLoading } =
    useTrendingProducts({ page: 1, limit: 8, category: "sunglasses" });

  const isLoading = allLoading || featuredLoading || trendingLoading;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="pt-16">
        <HeroCarousel />
      </div>

      {/* New Arrivals Section */}
      <NewArrivals 
        products={newArrivalsData?.products || []} 
        loading={newArrivalsLoading} 
      />

       {/* Featured Products (Mixed) */}
      <FeaturedProducts
        allProducts={allProductsData?.products || []}
        featuredProducts={featuredProductsData?.products || []}
        trendingProducts={trendingProductsData?.products || []}
        loading={isLoading}
        onViewAll={(filter: string) => {
          const query = filter === "all" ? "" : `?filter=${filter}`;
          router.push(`/products${query}`);
        }}
      />

      <CategorySection 
        title="Premium Eyewear" 
        subtitle="Crystal clear vision meeting modern design"
        categoryId="eyewear" 
        linkTo="/products?category=eyewear"
      />

      <CategorySection 
        title="Contact Lenses" 
        subtitle="Comfort and clarity for your daily life"
        categoryId="contact-lenses" 
        linkTo="/products?category=contact-lenses"
        bgColor="bg-blue-50"
      />

      {recentlyViewed.length > 0 && (
        <RecentlyViewed products={recentlyViewed} />
      )}

      {/* Category Grid Section */}
      <CategoryGrid />

      {/* Promo Banner Section */}
      <PromoBanner />
    </div>
  );
}
