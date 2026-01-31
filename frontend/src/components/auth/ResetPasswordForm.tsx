"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, ArrowLeft, Check, Loader2 } from "lucide-react";
import { ResetPasswordFormData, resetPasswordSchema } from "@/types/authTypes";
import { useResetPasswordMutation } from "@/hooks/useRegistration";
import Link from "next/link";

interface ResetPasswordFormProps {
  token?: string;
  onBackToLogin?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token: tokenProp,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = tokenProp || searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      token,
    },
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        token: data.token,
        newPassword: data.password,
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch {
      // Error handling is done in the mutation
    }
  };

  const getPasswordStrength = (
    password: string
  ): { score: number; text: string; color: string } => {
    if (!password)
      return { score: 0, text: "", color: "bg-gray-200" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { text: "Very weak", color: "bg-red-400" },
      { text: "Weak", color: "bg-orange-400" },
      { text: "Fair", color: "bg-yellow-400" },
      { text: "Good", color: "bg-blue-400" },
      { text: "Strong", color: "bg-green-500" },
    ];

    return { score, ...levels[Math.min(score, 4)] };
  };

  const passwordStrength = getPasswordStrength(password || "");
  const isLoading = isSubmitting || resetPasswordMutation.isPending;

  // Invalid token state
  if (!token) {
    return (
      <div className="w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Invalid Reset Link
        </h1>
        <p className="text-gray-600 mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create new password
        </h1>
        <p className="text-gray-600">
          Your new password must be different from previous passwords
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("token")} />

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                errors.password ? "border-red-300" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
          )}
          
          {/* Password Strength */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Password strength</span>
                <span className="text-gray-700 font-medium">{passwordStrength.text}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${passwordStrength.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Check className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                errors.confirmPassword ? "border-red-300" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Reset password
            </>
          )}
        </motion.button>
      </form>

      {/* Back to Login */}
      <div className="mt-8 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
};
