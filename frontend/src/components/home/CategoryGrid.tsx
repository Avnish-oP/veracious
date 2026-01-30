"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { fetchCategories } from "@/utils/api";

// Helper to get high-quality images for categories
const getCategoryImage = (name: string, index: number) => {
  const n = name.toLowerCase();
  
  // Curated premium images
  const images = {
    men: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop",
    women: "https://images.unsplash.com/photo-1570222094114-28a9d88a2d64?q=80&w=1200&auto=format&fit=crop",
    unisex: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1200&auto=format&fit=crop",
    kids: "https://images.unsplash.com/photo-1514782831304-632d84944dbd?q=80&w=1200&auto=format&fit=crop",
    sun: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop",
    reading: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1200&auto=format&fit=crop",
    sport: "https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=1200&auto=format&fit=crop",
  };

  if (n.includes("men") && !n.includes("women")) return images.men;
  if (n.includes("women")) return images.women;
  if (n.includes("unisex")) return images.unisex;
  if (n.includes("kid")) return images.kids;
  if (n.includes("sun")) return images.sun;
  if (n.includes("reading")) return images.reading;

  // Fallbacks with style
  const fallbacks = [
    "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483181954834-3687e741cc2d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590736969955-71cc53895d99?q=80&w=1200&auto=format&fit=crop",
  ];

  return fallbacks[index % fallbacks.length];
};

interface GridCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  colSpan: number; // 1, 2, or 3 (full width)
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<GridCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiCats: any[] = (res as any).categories || [];
        
        // Strategy: Create a balanced grid layout
        // Mobile: 1 col always
        // Tablet/Desktop: Mix of spans
        
        const curated: GridCategory[] = [];
        
        // Priority Buckets
        const primary = ["men", "women", "unisex"];
        const secondary = ["sunglasses", "eyeglasses", "reading"];
        
        // Helper to consume from API list
        const consume = (keywords: string[]) => {
          for (const k of keywords) {
             const idx = apiCats.findIndex(c => c.name.toLowerCase().includes(k));
             if (idx !== -1) return apiCats.splice(idx, 1)[0];
          }
          return null;
        };

        // 1. Hero Item (Full width or large)
        const hero = consume(["men"]) || apiCats.shift();
        if (hero) curated.push({ 
           id: hero.id, 
           title: hero.name, 
           description: "Refined aesthetics for the modern visionary.", 
           href: `/products?category=${hero.id}`, 
           image: getCategoryImage(hero.name, 0),
           colSpan: 2 
        });

        // 2. Secondary Hero
        const subHero = consume(["women"]) || apiCats.shift();
        if (subHero) curated.push({
           id: subHero.id,
           title: subHero.name,
           description: "Elegant frames that define your style.",
           href: `/products?category=${subHero.id}`,
           image: getCategoryImage(subHero.name, 1),
           colSpan: 1
        });

        // 3. Middle Row (Two items typically)
        const mid1 = consume(["unisex", "sun"]) || apiCats.shift();
        if (mid1) curated.push({
           id: mid1.id,
           title: mid1.name,
           description: "Versatile comfortable fits.",
           href: `/products?category=${mid1.id}`,
           image: getCategoryImage(mid1.name, 2),
           colSpan: 1
        });

        const mid2 = consume(["reading", "accessories", "shape"]) || apiCats.shift();
        if (mid2) curated.push({
           id: mid2.id,
           title: mid2.name,
           description: "Precision lenses for clarity.",
           href: `/products?category=${mid2.id}`,
           image: getCategoryImage(mid2.name, 3),
           colSpan: 2
        });

        // 4. Fill remaining (max 2 more to keep it clean)
        let count = 0;
        while(apiCats.length > 0 && count < 2) {
           const c = apiCats.shift();
           curated.push({
             id: c.id,
             title: c.name,
             description: "Explore our collection.",
             href: `/products?category=${c.id}`,
             image: getCategoryImage(c.name, count + 4),
             colSpan: 3 // Full width for spacers
           });
           count++;
        }

        setCategories(curated);
      } catch (e) {
        console.error("Failed to load categories", e);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) return null; // Minimize layout shift, or show skeleton
  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold tracking-widest uppercase mb-4">
             <Sparkles className="w-3 h-3" />
             <span>Collections</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections designed to elevate your vision and style.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                "group relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer block h-full min-h-[300px]",
                category.colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
                category.colSpan === 3 ? "md:col-span-3" : ""
              )}
            >
              <div className="absolute inset-0 bg-gray-200">
                  {/* Image with zoom effect */}
                  <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${category.image})` }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">{category.title}</h3>
                  <p className="text-gray-200 text-sm md:text-base mb-4 md:mb-6 opacity-90 max-w-md line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="inline-flex items-center text-sm font-semibold tracking-wide uppercase border-b border-transparent group-hover:border-white/50 pb-0.5 transition-all">
                    Explore Collection <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
