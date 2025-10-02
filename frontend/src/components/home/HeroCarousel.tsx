"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Sparkles,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/form-components";
import { useRouter } from "next/navigation";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: {
    text: string;
    href: string;
  };
  accent: string;
  backgroundGradient: string;
}

const slides: CarouselSlide[] = [
  {
    id: "1",
    title: "Premium Sunglasses Collection",
    subtitle: "Discover Your Perfect Style",
    description:
      "Explore our curated collection of premium sunglasses designed to complement your unique face shape and personal style.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    cta: {
      text: "Shop Collection",
      href: "/categories",
    },
    accent: "amber",
    backgroundGradient: "from-amber-100 via-orange-50 to-red-100",
  },
  {
    id: "2",
    title: "Advanced Face Shape Analysis",
    subtitle: "Find Your Perfect Match",
    description:
      "Our AI-powered face shape analysis helps you discover frames that enhance your natural features and boost your confidence.",
    image: "/api/placeholder/600/400",
    cta: {
      text: "Try Face Analysis",
      href: "/face-analysis",
    },
    accent: "blue",
    backgroundGradient: "from-blue-100 via-indigo-50 to-purple-100",
  },
  {
    id: "3",
    title: "Designer Brands",
    subtitle: "Luxury Meets Affordability",
    description:
      "Browse exclusive designer frames from the world's most prestigious brands, now accessible with our competitive pricing.",
    image: "/api/placeholder/600/400",
    cta: {
      text: "View Brands",
      href: "/brands",
    },
    accent: "emerald",
    backgroundGradient: "from-emerald-100 via-teal-50 to-cyan-100",
  },
];

export const HeroCarousel: React.FC = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  const getAccentColors = (accent: string) => {
    const colors = {
      amber: {
        primary: "from-amber-500 to-orange-500",
        light: "bg-amber-100 text-amber-800",
        ring: "ring-amber-500",
      },
      blue: {
        primary: "from-blue-500 to-indigo-500",
        light: "bg-blue-100 text-blue-800",
        ring: "ring-blue-500",
      },
      emerald: {
        primary: "from-emerald-500 to-teal-500",
        light: "bg-emerald-100 text-emerald-800",
        ring: "ring-emerald-500",
      },
    };
    return colors[accent as keyof typeof colors] || colors.amber;
  };

  const accentColors = getAccentColors(currentSlideData.accent);

  return (
    <div className="relative w-full min-h-[90vh] max-h-screen  overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.backgroundGradient}`}
        />
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="sunglasses-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <circle
                cx="10"
                cy="10"
                r="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sunglasses-pattern)" />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6 text-center lg:text-left"
              >
                {/* Subtitle Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${accentColors.light}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentSlideData.subtitle}
                </motion.div>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                >
                  {currentSlideData.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-600 max-w-2xl lg:max-w-none"
                >
                  {currentSlideData.description}
                </motion.p>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600"
                >
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    4.9/5 Rating
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-blue-500 mr-1" />
                    AI Face Analysis
                  </div>
                  <div className="flex items-center">
                    <ShoppingBag className="w-4 h-4 text-green-500 mr-1" />
                    Free Shipping
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Button
                    size="lg"
                    onClick={() => router.push(currentSlideData.cta.href)}
                    className="bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {currentSlideData.cta.text}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    // onClick={() => router.push("/auth/register")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    <a href="#featured-products">Explore Now</a>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Right Content - Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`image-${currentSlide}`}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
                  <div className="aspect-[4/3] bg-gray-50 border border-gray-100">
                    {/* Placeholder for actual product images */}
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="w-32 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-100">
                          <Eye className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium text-lg">
                          {currentSlideData.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Premium Sunglasses Collection
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        {/* Auto-play Toggle */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isAutoPlaying
              ? "bg-white/90 text-gray-700"
              : "bg-gray-700/90 text-white"
          }`}
        >
          <Play className={`w-4 h-4 ${isAutoPlaying ? "" : "opacity-50"}`} />
        </button>

        {/* Slide Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `bg-white ring-2 ${accentColors.ring} ring-offset-2`
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Side Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
};
