"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Glasses } from "lucide-react";
import { toast } from "react-hot-toast";
import { LoginFormData, loginSchema } from "@/types/authTypes";
import { useLoginMutation } from "@/hooks/useRegistration";
import { Button, Card, Input } from "@/components/ui/form-components";
import { useUserStore } from "@/store/useUserStore";
import { useCart } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "@/hooks/useUser";

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  // const { fetchUser } = useUserStore();
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
      // await fetchUser(); // Fetch user data after successful login
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      
      // Manually sync store to ensure mergeGuestCart has access to the user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = queryClient.getQueryData<any>(USER_QUERY_KEY);
      if (user) {
          useUserStore.getState().setUser(user);
      }

      // Merge guest cart with user cart
      await mergeGuestCart();

      toast.success("Welcome back!");
      router.push("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.status === 403 && error.data?.userId) {
        toast.error("Account not verified. Redirecting to verification...", { duration: 4000 });
        const params = new URLSearchParams({
          step: "2",
          userId: error.data.userId,
          email: data.email
        });
        router.push(`/auth/register?${params.toString()}`);
        return;
      }

      const errorMessage = error.message || "Invalid email or password";
      toast.error(errorMessage);

      // Set form errors for better UX
      if (errorMessage.toLowerCase().includes("email")) {
        setError("email", { message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("password")) {
        setError("password", { message: errorMessage });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-8 backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Glasses className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>

          <p className="text-slate-600">
            Sign in to continue your vision journey
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Input
              {...register("email")}
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              autoComplete="email"
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              icon={<Lock className="h-5 w-5" />}
              rightIcon={
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </motion.button>
              }
              error={errors.password?.message}
              autoComplete="current-password"
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Forgot Password Link */}
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={
                onForgotPassword || (() => router.push("/auth/forgot-password"))
              }
              className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              Forgot your password?
            </motion.button>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              type="submit"
              className="w-full h-14 text-base bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300"
              disabled={isSubmitting || loginMutation.isPending}
              loading={isSubmitting || loginMutation.isPending}
            >
              {isSubmitting || loginMutation.isPending ? (
                "Signing In..."
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Sign Up Link */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-slate-600">
                New to Veracious?
              </span>
            </div>
          </div>

          <motion.button
            onClick={() => router.push("/auth/register")}
            className="mt-4 inline-flex items-center px-6 py-3 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Glasses className="w-4 h-4 mr-2" />
            Create your account
          </motion.button>
        </motion.div>

        {/* Social Login Section (Optional for future) */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-xs text-slate-500">
            Secure login protected by industry-standard encryption
          </p>
        </motion.div>
      </Card>
    </motion.div>
  );
};
