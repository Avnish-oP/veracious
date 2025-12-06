"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Star,
  Sparkles,
  ShoppingBag,
  Eye,
  TrendingUp,
  Zap,
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
  tags?: string[];
}

const slides: CarouselSlide[] = [
  {
    id: "1",
    title: "Premium Eyewear Collection",
    subtitle: "Discover Your Perfect Style",
    description:
      "Explore our curated collection of premium sunglasses and eyeglasses designed to complement your unique face shape and personal style.",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    cta: {
      text: "Shop Collection",
      href: "/products",
    },
    accent: "amber",
    backgroundGradient: "from-amber-50 via-orange-50 to-red-50",
    tags: ["New Arrivals", "Trending", "Limited Edition"],
  },
  {
    id: "2",
    title: "Advanced Face Shape Analysis",
    subtitle: "Find Your Perfect Match",
    description:
      "Our AI-powered face shape analysis helps you discover frames that enhance your natural features and boost your confidence.",
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80",
    cta: {
      text: "Try Face Analysis",
      href: "/products",
    },
    accent: "blue",
    backgroundGradient: "from-blue-50 via-indigo-50 to-purple-50",
    tags: ["AI Powered", "Smart Tech", "Personalized"],
  },
  {
    id: "3",
    title: "Designer Brands",
    subtitle: "Luxury Meets Affordability",
    description:
      "Browse exclusive designer frames from the world's most prestigious brands, now accessible with our competitive pricing.",
    image:
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80",
    cta: {
      text: "View Brands",
      href: "/products",
    },
    accent: "emerald",
    backgroundGradient: "from-emerald-50 via-teal-50 to-cyan-50",
    tags: ["Premium", "Designer", "Exclusive"],
  },
  {
    id: "4",
    title: "Summer Collection 2025",
    subtitle: "Beat the Heat in Style",
    description:
      "Protect your eyes with our latest summer collection featuring UV protection, polarized lenses, and trendy designs.",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    cta: {
      text: "Shop Summer",
      href: "/products",
    },
    accent: "rose",
    backgroundGradient: "from-rose-50 via-pink-50 to-orange-50",
    tags: ["Summer Sale", "UV Protection", "Hot Deals"],
  },
];

export const HeroCarousel: React.FC = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide]
  );

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nextSlide, prevSlide]);

  const currentSlideData = slides[currentSlide];

  const getAccentColors = (accent: string) => {
    const colors = {
      amber: {
        primary: "bg-amber-500",
        light: "bg-amber-50 text-amber-700 border-amber-200",
        ring: "ring-amber-400",
        text: "text-amber-600",
        hover: "hover:bg-amber-600",
        glow: "bg-amber-500/20",
      },
      blue: {
        primary: "bg-blue-500",
        light: "bg-blue-50 text-blue-700 border-blue-200",
        ring: "ring-blue-400",
        text: "text-blue-600",
        hover: "hover:bg-blue-600",
        glow: "bg-blue-500/20",
      },
      emerald: {
        primary: "bg-emerald-500",
        light: "bg-emerald-50 text-emerald-700 border-emerald-200",
        ring: "ring-emerald-400",
        text: "text-emerald-600",
        hover: "hover:bg-emerald-600",
        glow: "bg-emerald-500/20",
      },
      rose: {
        primary: "bg-rose-500",
        light: "bg-rose-50 text-rose-700 border-rose-200",
        ring: "ring-rose-400",
        text: "text-rose-600",
        hover: "hover:bg-rose-600",
        glow: "bg-rose-500/20",
      },
    };
    return colors[accent as keyof typeof colors] || colors.amber;
  };

  const accentColors = getAccentColors(currentSlideData.accent);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-[95vh] md:h-[90vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Animated Background Gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.backgroundGradient}`}
        />
      </AnimatePresence>

      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`content-${currentSlide}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.5 },
                }}
                className="space-y-6 text-center lg:text-left z-10 order-last lg:order-first"
              >
                {/* Tags */}
                {currentSlideData.tags && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 justify-center lg:justify-start"
                  >
                    {currentSlideData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-gray-700 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Subtitle Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center lg:justify-start"
                >
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${accentColors.light}`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {currentSlideData.subtitle}
                  </div>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight"
                >
                  {currentSlideData.title.split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  {currentSlideData.description}
                </motion.p>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap hidden lg:flex justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-gray-600"
                >
                  <div className="flex items-center bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 fill-yellow-500" />
                    <span className="font-medium">4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-medium">AI Face Analysis</span>
                  </div>
                  <div className="flex items-center bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <ShoppingBag className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-medium">Free Shipping</span>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
                >
                  <Button
                    size="lg"
                    onClick={() => router.push(currentSlideData.cta.href)}
                    className={`${accentColors.primary} text-white ${accentColors.hover} shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-8`}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {currentSlideData.cta.text}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const element =
                        document.getElementById("featured-products");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white/80 backdrop-blur-sm font-medium px-8"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Explore Now
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Right Content - Image */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`image-${currentSlide}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.5 },
                }}
                className="relative block order-first lg:order-last -mt-12 h-64 lg:h-auto"
              >
                {/* Decorative Background Elements */}
                <div
                  className={`absolute -inset-4 ${accentColors.glow} blur-3xl rounded-full`}
                />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative"
                >
                  {/* Main Image Container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2 backdrop-blur-sm border border-white/50">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                      <img
                        src={currentSlideData.image}
                        alt={currentSlideData.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                      {/* Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className={`w-5 h-5 ${accentColors.text}`} />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Special Offer
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          30% OFF
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200">
          {/* Auto-play Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isAutoPlaying
                ? "bg-amber-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            title={isAutoPlaying ? "Pause" : "Play"}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </motion.button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <div
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? "w-8 h-3 bg-gray-800"
                      : "w-3 h-3 bg-gray-400 hover:bg-gray-600"
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-sm font-medium text-gray-700 ml-2">
            <span className="text-gray-900 font-bold">{currentSlide + 1}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-gray-500">{slides.length}</span>
          </div>
        </div>
      </div>

      {/* Side Navigation Arrows */}
      <motion.button
        onClick={prevSlide}
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 p-3 md:p-4 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 z-20 border border-gray-200"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </motion.button>
      <motion.button
        onClick={nextSlide}
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 p-3 md:p-4 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 z-20 border border-gray-200"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </motion.button>

      {/* Keyboard Navigation Hint */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 hidden md:block">
        <span className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200">
          Use arrow keys to navigate
        </span>
      </div>
    </div>
  );
};
