"use client";

import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, ArrowRight, ArrowLeft } from "lucide-react";
import { Step2FormData, step2Schema } from "@/types/registrationTypes";
import {
  useVerifyMutation,
  useResendVerificationMutation,
} from "@/hooks/useRegistration";

interface Step2Props {
  userId: string;
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const Step2Form: React.FC<Step2Props> = ({
  userId,
  onSuccess,
  onBack,
}) => {
  const verifyMutation = useVerifyMutation();
  const resendMutation = useResendVerificationMutation();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const verificationCode = watch("verificationCode");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6);
      setValue("verificationCode", pastedCode);
      pastedCode.split("").forEach((char, i) => {
        if (inputsRef.current[i]) {
          inputsRef.current[i]!.value = char;
        }
      });
      // Focus last filled input or next empty
      const nextIndex = Math.min(pastedCode.length, 5);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    const currentCode = verificationCode || "";
    const newCodeArr = currentCode.split("");
    // Pad with empty strings if currentCode is shorter than 6
    while (newCodeArr.length < 6) newCodeArr.push("");
    
    newCodeArr[index] = value;
    const newCode = newCodeArr.join("").slice(0, 6);
    setValue("verificationCode", newCode);

    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !inputsRef.current[index]?.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: Step2FormData) => {
    try {
      await verifyMutation.mutateAsync({
        userId,
        code: data.verificationCode,
      });
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
       setError("root", { message: error.message || "Invalid verification code" });
    }
  };

  const handleResendCode = async () => {
    try {
      await resendMutation.mutateAsync({ userId });
    } catch {
       // handled by mutation toast
    }
  };

  const isLoading = isSubmitting || verifyMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* OTP Inputs */}
      <div className="flex justify-between gap-2 sm:gap-4">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            type="text"
            maxLength={1}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${
              errors.verificationCode || errors.root ? "border-red-300" : "border-gray-200"
            } ${isSubmitting ? "opacity-50" : ""}`}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
          />
        ))}
      </div>

      {(errors.verificationCode || errors.root) && (
        <p className="text-center text-sm text-red-500">
          {errors.verificationCode?.message || errors.root?.message}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={isLoading || (verificationCode?.length || 0) < 6}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
          {!isLoading && <ArrowRight className="w-5 h-5" />}
        </button>

        <div className="flex justify-between items-center text-sm">
           <button
             type="button"
             onClick={onBack}
             className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
           >
             <ArrowLeft className="w-4 h-4" /> Back
           </button>
           
           <button
             type="button"
             onClick={handleResendCode}
             disabled={resendMutation.isPending}
             className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 disabled:opacity-50"
           >
             {resendMutation.isPending ? "Sending..." : "Resend Code"}
             <RefreshCw className={`w-4 h-4 ${resendMutation.isPending ? "animate-spin" : ""}`} />
           </button>
        </div>
      </div>
    </form>
  );
};
