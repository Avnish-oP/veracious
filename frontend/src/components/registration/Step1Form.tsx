"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, Mail, Phone, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Step1FormData, step1Schema } from "@/types/registrationTypes";
import { useRegisterMutation } from "@/hooks/useRegistration";
import {
  Button,
  Input,
  Card,
  PhoneInput,
} from "@/components/ui/form-components";

interface Step1Props {
  onSuccess: (data: {
    userId: string;
    userData: Omit<Step1FormData, "confirmPassword">;
  }) => void;
}

export const Step1Form: React.FC<Step1Props> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (data: Step1FormData) => {
    try {
      const { confirmPassword, ...registrationData } = data;
      const response = await registerMutation.mutateAsync(registrationData);

      if (response.success) {
        onSuccess({
          userId: response.user.id,
          userData: registrationData,
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const getPasswordStrength = (
    password: string
  ): { score: number; text: string; color: string } => {
    if (!password) return { score: 0, text: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const strengthMap = {
      0: { text: "", color: "" },
      1: { text: "Very Weak", color: "text-red-500" },
      2: { text: "Weak", color: "text-orange-500" },
      3: { text: "Fair", color: "text-yellow-500" },
      4: { text: "Good", color: "text-blue-500" },
      5: { text: "Strong", color: "text-green-500" },
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-3xl opacity-60" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card
        variant="glass"
        className="relative z-10 w-full max-w-md mx-auto border-amber-200/30"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-slate-600">
            Create your account and discover eyewear that matches your style
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Input
              {...register("name")}
              label="Full Name"
              placeholder="Enter your full name"
              icon={<User className="h-5 w-5" />}
              error={errors.name?.message}
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Input
              {...register("email")}
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Phone Field */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label="Phone Number"
                  error={errors.phoneNumber?.message}
                  className="transition-all duration-300 hover:border-amber-300"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Create a strong password"
              icon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.password?.message}
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
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your password"
              icon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.confirmPassword?.message}
              className="transition-all duration-300 hover:border-amber-300"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full relative overflow-hidden group"
              loading={isSubmitting || registerMutation.isPending}
              disabled={isSubmitting || registerMutation.isPending}
            >
              <span className="relative z-10">Create Your Account</span>
            </Button>
          </motion.div>

          {/* Terms and Privacy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-xs text-slate-500 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a
                href="/terms"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </form>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-20" />
      </Card>
    </div>
  );
};
