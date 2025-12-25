"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/form-components";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export const PromoBanner: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with Parallax-like effect */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-fixed bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1505236273191-1dce846b92e7?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-300 text-sm font-semibold tracking-wider uppercase">
              Limited Time Offer
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            The Golden Hour <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
              Collection
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the world through a warmer lens. Our new polarized series offers superior protection with a vintage aesthetic inspired by the setting sun.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products?collection=golden-hour">
                <Button 
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg px-8 py-6 h-auto"
                >
                    Shop the Collection
                </Button>
            </Link>
            <Link href="/about">
                <Button 
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-6 h-auto backdrop-blur-sm bg-transparent"
                >
                    Read Our Story <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
