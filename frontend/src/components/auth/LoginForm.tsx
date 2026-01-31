"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { LoginFormData, loginSchema } from "@/types/authTypes";
import { useLoginMutation } from "@/hooks/useRegistration";
import { useUserStore } from "@/store/useUserStore";
import { useCart, CART_QUERY_KEY } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "@/hooks/useUser";
import Link from "next/link";

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();
  const { mergeGuestCart } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);

      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: USER_QUERY_KEY });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = queryClient.getQueryData<any>(USER_QUERY_KEY);
      if (user) {
        useUserStore.getState().setUser(user);
      }

      await mergeGuestCart();
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: CART_QUERY_KEY });

      toast.success("Welcome back!");

      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.status === 403 && error.data?.userId) {
        toast.error("Account not verified. Redirecting to verification...", {
          duration: 4000,
        });
        const params = new URLSearchParams({
          step: "2",
          userId: error.data.userId,
          email: data.email,
        });
        router.push(`/auth/register?${params.toString()}`);
        return;
      }

      const errorMessage = error.message || "Invalid email or password";
      toast.error(errorMessage);

      if (errorMessage.toLowerCase().includes("email")) {
        setError("email", { message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("password")) {
        setError("password", { message: errorMessage });
      }
    }
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-gray-600">
          Sign in to continue to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                errors.email ? "border-red-300" : "border-gray-200"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
                errors.password ? "border-red-300" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword || (() => router.push("/auth/forgot-password"))}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Forgot password?
          </button>
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
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-gray-500">
            New to Otticamart?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link
        href="/auth/register"
        className="w-full py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
      >
        Create an account
      </Link>
    </div>
  );
};
