"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { fetchCategories } from "@/utils/api";
import { Category } from "@/types/productTypes";

// Fallback/Static images mapping based on category names or types
const getCategoryImage = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("men") && !n.includes("women"))
    return "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?q=80&w=800&auto=format&fit=crop";
  if (n.includes("women"))
    return "https://images.unsplash.com/photo-1570222094114-28a9d88a2d64?q=80&w=800&auto=format&fit=crop";
  if (n.includes("unisex"))
    return "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop";
  if (n.includes("kid"))
    return "https://images.unsplash.com/photo-1514782831304-632d84944dbd?q=80&w=800&auto=format&fit=crop";
  if (n.includes("sport"))
    return "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop"; // Placeholder
  if (n.includes("reading"))
    return "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop";
  if (n.includes("sun"))
    return "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800&auto=format&fit=crop";

  // Default random nice eyewear images
  return "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800&auto=format&fit=crop";
};

interface GridCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  size: "large" | "normal" | "wide";
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<GridCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        const apiCats: any[] = res.categories || [];

        // Prioritize: Men, Women, Unisex, then others
        // We want to fill 4 slots: 1 Large, 2 Normal, 1 Wide
        
        let mapped: GridCategory[] = [];
        
        // Helper to find and map specific categories
        const findAndMap = (keyword: string, size: "large" | "normal" | "wide", desc: string) => {
          const found = apiCats.find(c => c.name.toLowerCase().includes(keyword));
          if (found) {
            mapped.push({
              id: found.id,
              title: found.name,
              description: desc,
              href: `/products?category=${found.id}`, // Filter by Category ID
              image: getCategoryImage(found.name),
              size: size,
            });
            // Remove from pool to avoid duplicates if we iterate later
            const idx = apiCats.indexOf(found);
            if (idx > -1) apiCats.splice(idx, 1);
            return true;
          }
          return false;
        };

        // 1. Slot 1 (Large): Men
        const hasMen = findAndMap("men", "large", "Sophisticated frames for the modern gentleman.");
        
        // 2. Slot 2 (Normal): Women
        const hasWomen = findAndMap("women", "normal", "Elegant styles for every occasion.");

        // 3. Slot 3 (Normal): Unisex or Kids or shape
        if (!findAndMap("unisex", "normal", "Versatile designs for everyone.")) {
             // Try fetching a Shape or other type if Unisex missing
             if (apiCats.length > 0) {
                 const next = apiCats.shift();
                 mapped.push({
                     id: next.id,
                     title: next.name,
                     description: "Discover our latest styles.",
                     href: `/products?category=${next.id}`,
                     image: getCategoryImage(next.name),
                     size: "normal"
                 });
             }
        }

        // 4. [NEW] Slot 4 (Large): Reading, Sun, Sport, or Next Available
        // This fills the space next to Unisex (2 cols)
        let slot4Filled = false;
        if (findAndMap("reading", "large", "Crystal clear vision for reading.")) slot4Filled = true;
        else if (findAndMap("sun", "large", "Protect your eyes in style.")) slot4Filled = true;
        else if (findAndMap("sport", "large", "Performance eyewear for athletes.")) slot4Filled = true;
        
        if (!slot4Filled && apiCats.length > 0) {
             const next = apiCats.shift();
             mapped.push({
                 id: next.id,
                 title: next.name,
                 description: "Premium eyewear collection.",
                 href: `/products?category=${next.id}`,
                 image: getCategoryImage(next.name),
                 size: "large"
             });
        }

        // 5. Slot 5 (Wide): Accessories or Collections
        // Just take the next available one
        if (apiCats.length > 0) {
             const next = apiCats.shift();
             mapped.push({
                 id: next.id,
                 title: next.name,
                 description: "Essential eyewear and more.",
                 href: `/products?category=${next.id}`,
                 image: getCategoryImage(next.name),
                 size: "wide"
             });
        }

        // If we still don't have 4 items (e.g. empty DB), use fallbacks?
        // Or if we have mostly empty DB, just show what we have. 
        // But for layout stability, ensuring 4 items is good. 
        // If DB is empty, effectively we show nothing or skeleton.
        
        setCategories(mapped);
      } catch (e) {
        console.error("Failed to load categories for grid", e);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
      return <div className="py-20 text-center text-gray-400">Loading categories...</div>;
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm">
            Discover
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of eyewear, tailored to fit your unique style and needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[400px]">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                "relative group overflow-hidden rounded-2xl cursor-pointer block h-[300px] md:h-full",
                category.size === "large" ? "md:col-span-2" : "",
                category.size === "wide" ? "md:col-span-3" : ""
              )}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative h-full w-full"
              >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${category.image})` }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-gray-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                    Shop Now <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
