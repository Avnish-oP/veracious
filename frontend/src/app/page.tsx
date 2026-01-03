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
import { PromoBanner } from "@/components/home/PromoBanner";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Star,
  Users,
  Award,
  Truck,
  RefreshCw,
  Phone,
} from "lucide-react";


// features array removed (unused)

// stats array removed (unused)

export default function Home() {
  const router = useRouter();

  // Fetch all products (page 1)
  const { data: allProductsData, isLoading: allLoading } = useProducts({
    page: 1,
    limit: 8,
  });

  // Fetch New Arrivals (limit 8) - useProducts sorts by createdAt desc by default
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useProducts({
    page: 1,
    limit: 8,
  });

  const { recentlyViewed } = useRecentlyViewed();

  // Fetch featured products (page 1)
  const { data: featuredProductsData, isLoading: featuredLoading } =
    useFeaturedProducts({ page: 1, limit: 8 });

  // Fetch trending products (page 1)
  const { data: trendingProductsData, isLoading: trendingLoading } =
    useTrendingProducts({ page: 1, limit: 8 });

  const isLoading = allLoading || featuredLoading || trendingLoading;

  // getColorClasses removed (unused)

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

      {/* Featured Products */}
      <FeaturedProducts
        allProducts={allProductsData?.products || []}
        featuredProducts={featuredProductsData?.products || []}
        trendingProducts={trendingProductsData?.products || []}
        loading={isLoading}
        onViewAll={(filter: string) => {
          // Navigate to products page with filter query
          const query = filter === "all" ? "" : `?filter=${filter}`;
          router.push(`/products${query}`);
        }}
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
