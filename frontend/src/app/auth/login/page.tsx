"use client";

import React, { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { useUser } from "@/hooks/useUser";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      const redirectTo = searchParams.get("redirect") || "/";
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, searchParams]);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/otticamart1.png"
                alt="Otticamart"
                width={200}
                height={60}
                className="object-contain mx-auto brightness-0 invert"
              />
            </div>
            
            {/* Tagline */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Premium Eyewear
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Discover the perfect frames that match your style and personality
            </p>
            
            {/* Features */}
            <div className="mt-12 space-y-4">
              {[
                "Authentic designer frames",
                "Free shipping on orders above ₹999",
                "Easy 14-day returns"
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-center gap-3 text-slate-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/otticamart1.png"
              alt="Otticamart"
              width={160}
              height={48}
              className="object-contain mx-auto"
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <div className="flex justify-center gap-6 mb-4">
              <Link href="/privacy" className="hover:text-amber-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-amber-600 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-amber-600 transition-colors">
                Support
              </Link>
            </div>
            <p className="text-gray-400">
              © 2026 Otticamart. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
