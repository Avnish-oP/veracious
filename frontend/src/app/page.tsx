"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { useFeaturedProducts } from "@/hooks/useProducts";
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
  const {
    data: featuredProductsData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useFeaturedProducts(8);

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

      {/* Featured Products */}
      <FeaturedProducts
        products={featuredProductsData?.products || []}
        loading={featuredLoading}
        error={featuredError?.message}
        onViewAll={() => router.push("/products")}
      />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Why Choose Veracious
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Premium Eyewear
              </span>
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover why thousands of customers trust us for their eyewear
              needs. From cutting-edge technology to exceptional service.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className={`w-16 h-16 ${getColorClasses(
                      feature.color
                    )} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Find Your Perfect Frames?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've discovered their
              ideal eyewear with our AI-powered face shape analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/auth/register")}
                className="bg-white text-amber-600 hover:bg-amber-50 border-none shadow-lg px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/products")}
                className="border-white text-white hover:bg-white/10 px-8"
              >
                Browse Collection
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

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
