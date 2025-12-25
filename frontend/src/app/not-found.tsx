"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/form-components";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-amber-200 blur-3xl opacity-30 rounded-full" />
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-amber-100">
            <AlertCircle className="w-24 h-24 text-amber-500" />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-8xl font-bold text-gray-900 tracking-tighter"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-semibold text-gray-800"
          >
            Page Not Found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-lg max-w-md mx-auto"
          >
            We looked everywhere for this page. Are you sure the website URL is
            correct?
          </motion.p>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 rounded-xl flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all">
              <Home className="w-5 h-5" />
              Return Home
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-3.5 rounded-xl border-2 border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}
