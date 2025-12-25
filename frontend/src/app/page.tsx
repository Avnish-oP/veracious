"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/form-components";

const features = [
  {
    icon: Shield,
    title: "Perfect Fit Guarantee",
    description:
      "Our advanced face shape analysis ensures you find frames that complement your unique features perfectly.",
    color: "blue",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "Curated collection of high-quality frames from trusted brands with lifetime warranties and excellent support.",
    color: "emerald",
  },
  {
    icon: Sparkles,
    title: "Face Shape Analysis",
    description:
      "Advanced AI technology to determine your face shape and find the most flattering frames for your style.",
    color: "purple",
  },
];

const stats = [
  { icon: Users, label: "Happy Customers", value: "50,000+" },
  { icon: Star, label: "Average Rating", value: "4.9/5" },
  { icon: Award, label: "Premium Brands", value: "100+" },
  { icon: Truck, label: "Free Shipping", value: "Worldwide" },
];

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

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      emerald: "bg-emerald-100 text-emerald-600",
      purple: "bg-purple-100 text-purple-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Veracious</span>
              </div>
              <p className="text-gray-400 mb-4">
                Discover premium eyewear that perfectly complements your style
                and enhances your vision.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors duration-200">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/products"
                    className="hover:text-white transition-colors duration-200"
                  >
                    All Products
                  </a>
                </li>
                <li>
                  <a
                    href="/featured"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Featured
                  </a>
                </li>
                <li>
                  <a
                    href="/categories"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="/brands"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Brands
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/help"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="/returns"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Returns
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Free Returns
                </li>
                <li className="flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Free Shipping
                </li>
                <li className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Warranty
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Face Analysis
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Veracious. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
