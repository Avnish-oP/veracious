"use client";

import React, { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun } from "lucide-react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { useUser } from "@/hooks/useUser";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to the original page they were trying to access, or home
      const redirectTo = searchParams.get("redirect") || "/";
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">

      {/* Creative Header Title Area */}
      <div className=" z-10 pt- pb-">
        <motion.div
          className="text-center -mt-16 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand Logo/Icon */}
          <motion.div
            className=" mb-50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="relative h-1">
      
                <Image
                  src="/otticamart1.png"
                  alt="Ottichamart Logo"
                  width={280}
                  height={180}
                  className=" object-cover"
                />
              
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            className="flex items-center justify-center space-x-2 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <p className="text-xl text-slate-600 font-medium">
              Welcome Back to Premium Vision
            </p>
            <Sparkles className="w-5 h-5 text-orange-500" />
          </motion.div>

          <motion.p
            className="text-slate-500 max-w-md mx-auto mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Continue your journey with the world&apos;s finest eyewear
            collection
          </motion.p>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <LoginForm />
          </motion.div>
        </div>
      </main>

      {/* Footer Links */}
      <motion.div
        className="relative z-10 text-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex justify-center space-x-6 text-sm text-slate-500 mb-4">
          <motion.a
            href="/privacy"
            className="hover:text-amber-600 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Privacy Policy
          </motion.a>
          <motion.a
            href="/terms"
            className="hover:text-amber-600 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Terms of Service
          </motion.a>
          <motion.a
            href="/support"
            className="hover:text-amber-600 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Support
          </motion.a>
        </div>

        <p className="text-xs text-slate-400">
          © 2026 Ottichamart. Crafting premium vision experiences worldwide.
        </p>
      </motion.div>

      {/* Floating Elements for Visual Appeal */}
      <motion.div
        className="absolute top-1/4 left-10 w-4 h-4 bg-amber-300/40 rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/3 right-16 w-6 h-6 bg-orange-300/30 rounded-full"
        animate={{
          y: [0, 15, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-red-300/50 rounded-full"
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
