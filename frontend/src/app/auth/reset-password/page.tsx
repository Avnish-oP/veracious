"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun } from "lucide-react";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, loading } = useUserStore();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-200/30 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-r from-yellow-200/20 to-amber-300/20 rounded-full blur-2xl" />
      </div>

      {/* Creative Header Title Area */}
      <div className="relative z-10 pt-16 pb-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand Logo/Icon */}
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden p-3">
                <Image
                  src="/otticamart1.png"
                  alt="Ottichamart Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sun className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Ottichamart
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.div
            className="flex items-center justify-center space-x-2 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <p className="text-xl text-slate-600 font-medium">
              Secure Password Reset
            </p>
            <Sparkles className="w-5 h-5 text-orange-500" />
          </motion.div>

          <motion.p
            className="text-slate-500 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Create a new secure password and regain access to your account
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
            <React.Suspense fallback={<div className="h-96 bg-white/50 backdrop-blur rounded-2xl animate-pulse" />}>
              <ResetPasswordForm />
            </React.Suspense>
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
            href="/support"
            className="hover:text-amber-600 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Need Help?
          </motion.a>
          <motion.a
            href="/auth/login"
            className="hover:text-amber-600 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Back to Login
          </motion.a>
        </div>

        <p className="text-xs text-slate-400">
          Your account security is our priority
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
