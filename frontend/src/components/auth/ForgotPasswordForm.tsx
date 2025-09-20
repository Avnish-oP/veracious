"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, Glasses } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/types/authTypes";
import { useForgotPasswordMutation } from "@/hooks/useRegistration";
import { Button, Card, Input } from "@/components/ui/form-components";

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
}) => {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      reset();
    } catch (error) {
      // Error handling is done in the mutation
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
            <Mail className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>

          <p className="text-slate-600 max-w-sm mx-auto">
            Enter your email address and we'll send you instructions to reset
            your password
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
              placeholder="Enter your email address"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              autoComplete="email"
              autoFocus
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              type="submit"
              className="w-full h-14 text-base bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300"
              disabled={isSubmitting || forgotPasswordMutation.isPending}
              loading={isSubmitting || forgotPasswordMutation.isPending}
            >
              {isSubmitting || forgotPasswordMutation.isPending ? (
                "Sending Reset Link..."
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Send Reset Link</span>
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
          transition={{ delay: 0.6, duration: 0.5 }}
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

        {/* Footer Info */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-xs text-slate-500">
            Remember your password?{" "}
            <motion.button
              onClick={onBackToLogin || (() => router.push("/auth/login"))}
              className="text-amber-600 hover:text-amber-700 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Sign in here
            </motion.button>
          </p>
        </motion.div>
      </Card>
    </motion.div>
  );
};
