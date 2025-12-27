"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, ArrowLeft, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { ResetPasswordFormData, resetPasswordSchema } from "@/types/authTypes";
import { useResetPasswordMutation } from "@/hooks/useRegistration";
import { Button, Card, Input } from "@/components/ui/form-components";

interface ResetPasswordFormProps {
  token?: string;
  onBackToLogin?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token: tokenProp,
  onBackToLogin,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get token from props or URL params
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

      // Redirect to login after successful reset
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getPasswordStrength = (
    password: string
  ): { score: number; text: string; color: string } => {
    if (!password)
      return { score: 0, text: "Enter password", color: "text-slate-400" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { text: "Very weak", color: "text-red-500" },
      { text: "Weak", color: "text-orange-500" },
      { text: "Fair", color: "text-yellow-500" },
      { text: "Good", color: "text-blue-500" },
      { text: "Strong", color: "text-green-500" },
    ];

    return { score, ...levels[Math.min(score, 4)] };
  };

  const passwordStrength = getPasswordStrength(password || "");

  // Check if token is missing
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 backdrop-blur-xl bg-white/95 border-white/20 shadow-2xl">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-slate-600 mb-6">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600"
            >
              Request New Reset Link
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

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
            <Shield className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            Reset Your Password
          </h1>

          <p className="text-slate-600">
            Create a new secure password for your account
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden Token Field */}
          <input type="hidden" {...register("token")} />

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="Create a strong password"
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
              autoComplete="new-password"
              className="transition-all duration-300 hover:border-amber-300"
            />

            {/* Password Strength Indicator */}
            <AnimatePresence>
              {password && passwordStrength.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={passwordStrength.color}>
                      Password strength: {passwordStrength.text}
                    </span>
                    <span className="text-slate-400">
                      {passwordStrength.score}/5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        passwordStrength.score <= 2
                          ? "bg-red-400"
                          : passwordStrength.score <= 3
                          ? "bg-yellow-400"
                          : passwordStrength.score <= 4
                          ? "bg-blue-400"
                          : "bg-green-400"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your new password"
              icon={<Check className="h-5 w-5" />}
              rightIcon={
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </motion.button>
              }
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              type="submit"
              className="w-full h-14 text-base bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300"
              disabled={isSubmitting || resetPasswordMutation.isPending}
              loading={isSubmitting || resetPasswordMutation.isPending}
            >
              {isSubmitting || resetPasswordMutation.isPending ? (
                "Resetting Password..."
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Reset Password</span>
                </span>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Back to Login */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.button
            onClick={onBackToLogin || (() => router.push("/auth/login"))}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </motion.button>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <p className="text-xs text-slate-500">
            After resetting your password, you&apos;ll be automatically redirected to
            the login page
          </p>
        </motion.div>
      </Card>
    </motion.div>
  );
};
