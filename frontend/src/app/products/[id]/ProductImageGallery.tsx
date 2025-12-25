import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ZoomIn } from "lucide-react";
import { cn } from "@/utils/cn";
import { Product, ProductImage } from "@/types/productTypes";

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

  const images = product.images || [];
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sticky top-24"
    >
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <AnimatePresence mode="wait">
          {images.length > 0 ? (
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-transform duration-500",
                  isZoomed ? "scale-150" : "group-hover:scale-105"
                )}
                priority
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

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <ZoomIn className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
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
    </motion.div>
  );
};
