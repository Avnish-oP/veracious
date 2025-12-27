"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Shield, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Step2FormData, step2Schema } from "@/types/registrationTypes";
import {
  useVerifyMutation,
  useResendVerificationMutation,
} from "@/hooks/useRegistration";
import { Button, Card } from "@/components/ui/form-components";

interface Step2Props {
  userId: string;
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const Step2Form: React.FC<Step2Props> = ({
  userId,
  email,
  onSuccess,
  onBack,
}) => {
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = React.useState(0);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useVerifyMutation();
  const resendMutation = useResendVerificationMutation();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
  });

  const verificationCode = watch("verificationCode");

  // Start resend timer
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input changes
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split("");
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      setValue("verificationCode", newCode.join(""));

      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setValue("verificationCode", newCode.join(""));

      // Move to next input if digit entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-submit when code is complete
  React.useEffect(() => {
    if (verificationCode && verificationCode.length === 6) {
      handleSubmit(onSubmit)();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCode]);

  const onSubmit = async (data: Step2FormData) => {
    try {
      const response = await verifyMutation.mutateAsync({
        userId,
        code: data.verificationCode,
      });

      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      // Reset the code on error
      setCode(["", "", "", "", "", ""]);
      setValue("verificationCode", "");
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    try {
      await resendMutation.mutateAsync({ userId });
      setResendTimer(60); // 60 second cooldown
      setCode(["", "", "", "", "", ""]);
      setValue("verificationCode", "");
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

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
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h1>
          <p className="text-slate-600 mb-2">
            We&apos;ve sent a 6-digit verification code to
          </p>
          <motion.p
            className="text-amber-600 font-semibold text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {maskedEmail}
          </motion.p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-14 text-center text-xl font-bold bg-white/70 backdrop-blur-sm border-2 rounded-xl transition-all duration-300 focus:outline-none shadow-sm hover:shadow-md focus:shadow-lg ${
                    errors.verificationCode
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : digit
                      ? "border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-green-700"
                      : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  }`}
                  onFocus={(e) => e.target.select()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                />
              ))}
            </div>
            <AnimatePresence>
              {errors.verificationCode && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-600 mt-3 text-center flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.verificationCode.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="flex justify-center items-center space-x-2 text-sm text-slate-500">
              <span>{verificationCode?.length || 0}/6</span>
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((verificationCode?.length || 0) / 6) * 100}%`,
                  }}
                />
              </div>
              {verificationCode?.length === 6 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Verify Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full relative overflow-hidden group"
              loading={verifyMutation.isPending}
              disabled={
                verifyMutation.isPending || verificationCode?.length !== 6
              }
            >
              <span className="relative z-10">Verify Email</span>
            </Button>
          </motion.div>

          {/* Resend Code */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-3"
          >
            <p className="text-sm text-slate-600">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendTimer > 0 || resendMutation.isPending}
              className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  resendMutation.isPending ? "animate-spin" : ""
                }`}
              />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </button>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-slate-600 hover:text-slate-800 py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ← Back to Registration
            </button>
          </motion.div>
        </form>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 bg-amber-50/50 backdrop-blur-sm rounded-xl border border-amber-200/30"
        >
          <p className="text-xs text-slate-600 text-center leading-relaxed">
            💡 Check your spam folder if you don&apos;t see the email. The code
            expires in 10 minutes.
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-20" />
      </Card>
    </div>
  );
};
