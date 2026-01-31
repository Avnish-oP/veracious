import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Product } from "@/types/productTypes";

interface ProductImageGalleryProps {
  product: Product;
  discountPercentage: number;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  product,
  discountPercentage,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const images = product.images || [];
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;
  const totalImages = images.length;

  const goToNext = useCallback(() => {
    if (selectedImageIndex < totalImages - 1) {
      setSwipeDirection("left");
      setSelectedImageIndex(prev => prev + 1);
    }
  }, [selectedImageIndex, totalImages]);

  const goToPrev = useCallback(() => {
    if (selectedImageIndex > 0) {
      setSwipeDirection("right");
      setSelectedImageIndex(prev => prev - 1);
    }
  }, [selectedImageIndex]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartRef.current - touchEndRef.current;
    const threshold = 50; // minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - go to next
        goToNext();
      } else {
        // Swiped right - go to prev
        goToPrev();
      }
    }
    
    // Reset
    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape" && isZoomed) setIsZoomed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, isZoomed]);

  // Animation variants for slide effect
  const slideVariants = {
    enter: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right" | null) => ({
      x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sticky top-24"
    >
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={swipeDirection}>
          {images.length > 0 ? (
            <motion.div
              key={selectedImageIndex}
              custom={swipeDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative w-full h-full"
              onClick={() => !isZoomed && setIsZoomed(true)}
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-transform duration-500 select-none pointer-events-none",
                  isZoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-105 cursor-zoom-in"
                )}
                priority
                draggable={false}
              />
            </motion.div>
          ) : (
             <div className="flex items-center justify-center h-full bg-gray-50">
               <ShoppingCart className="w-24 h-24 text-gray-200" />
             </div>
          )}
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isFeatured && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm bg-opacity-90"
            >
              Featured
            </motion.span>
          )}
          {discountPercentage > 0 && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm bg-opacity-90"
            >
              Save {discountPercentage}%
            </motion.span>
          )}
        </div>

        {/* Mobile Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              disabled={selectedImageIndex === 0}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all",
                "md:opacity-0 md:group-hover:opacity-100",
                selectedImageIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-100 hover:bg-white"
              )}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              disabled={selectedImageIndex === totalImages - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all",
                "md:opacity-0 md:group-hover:opacity-100",
                selectedImageIndex === totalImages - 1 ? "opacity-30 cursor-not-allowed" : "opacity-100 hover:bg-white"
              )}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
           <ZoomIn className="w-5 h-5 text-gray-700" />
        </div>

        {/* Mobile Dot Indicators */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(index); }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  selectedImageIndex === index 
                    ? "bg-amber-500 w-6" 
                    : "bg-white/70 hover:bg-white"
                )}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {totalImages > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10">
            {selectedImageIndex + 1} / {totalImages}
          </div>
        )}
      </div>

      {/* Desktop Thumbnail Images */}
      {images.length > 1 && (
        <div className="hidden md:grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300",
                selectedImageIndex === index
                  ? "border-amber-500 ring-2 ring-amber-200 ring-offset-2"
                  : "border-transparent hover:border-amber-200 bg-gray-50"
              )}
            >
              <Image
                src={image.url}
                alt={`${product.name} - view ${index + 1}`}
                fill
                className="object-cover"
              />
              {selectedImageIndex === index && (
                <div className="absolute inset-0 bg-amber-500/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:hidden">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                selectedImageIndex === index
                  ? "border-amber-500"
                  : "border-gray-200"
              )}
            >
              <Image
                src={image.url}
                alt={`${product.name} - view ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

