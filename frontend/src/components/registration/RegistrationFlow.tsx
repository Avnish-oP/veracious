"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Glasses } from "lucide-react";
import { RegistrationState, Step1FormData } from "@/types/registrationTypes";
import { useLoginMutation } from "@/hooks/useRegistration";
import { useUserStore } from "@/store/useUserStore";
import { useCart } from "@/hooks/useCart";
import { User } from "@/types/userTypes";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "@/hooks/useUser";
import { Progress } from "@/components/ui/form-components";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Form } from "./Step3Form";

export const RegistrationFlow: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
  // const { fetchUser } = useUserStore();
  const queryClient = useQueryClient();
  const { mergeGuestCart } = useCart();

  const [registrationState, setRegistrationState] =
    React.useState<RegistrationState>({
      currentStep: 1,
    });

  React.useEffect(() => {
    const stepParam = searchParams.get("step");
    const userIdParam = searchParams.get("userId");
    const emailParam = searchParams.get("email");

    if (stepParam === "2" && userIdParam && emailParam) {
      setRegistrationState((prev) => ({
        ...prev,
        currentStep: 2,
        userId: userIdParam,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        step1Data: { email: emailParam } as any, // TODO: Fix proper type
      }));
    }
  }, [searchParams]);

  const steps = ["Create Account", "Verify Email", "Personalize"];

  // Step 1 Success Handler
  const handleStep1Success = (data: {
    userId: string;
    userData: Omit<Step1FormData, "confirmPassword">;
  }) => {
    setRegistrationState((prev) => ({
      ...prev,
      currentStep: 2,
      userId: data.userId,
      step1Data: data.userData,
    }));
    toast.success(
      "Account created! Please check your email for verification code."
    );
  };

  // Step 1 Back Handler (go to login) - Unused but kept for logic if needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStep1Back = () => {
    router.push("/auth/login");
  };

  // Step 2 Success Handler
  const handleStep2Success = () => {
    setRegistrationState((prev) => ({
      ...prev,
      currentStep: 3,
    }));
    toast.success("Email verified successfully!");
  };

  // Step 2 Back Handler
  const handleStep2Back = () => {
    setRegistrationState((prev) => ({
      ...prev,
      currentStep: 1,
    }));
  };

  // Step 3 Success Handler
  const handleStep3Success = async () => {
    if (registrationState.step1Data) {
      try {
        await loginMutation.mutateAsync({
          email: registrationState.step1Data.email,
          password: registrationState.step1Data.password,
        });
        // await fetchUser(); // Fetch user data after successful login
        await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });

        // Manually sync store
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = queryClient.getQueryData<any>(USER_QUERY_KEY);
        if (user) {
            useUserStore.getState().setUser(user);
        }

        // Merge guest cart with user cart
        await mergeGuestCart();

        toast.success("Registration completed! Welcome to Veracious!");
        router.push("/");
      } catch (error) {
        // If auto-login fails, redirect to login page
        toast.success("Registration completed! Please log in to continue.");
        router.push("/auth/login");
      }
    } else {
      toast.success("Registration completed!");
      router.push("/auth/login");
    }
  };

  // Step 3 Skip Handler
  const handleStep3Skip = async () => {
    if (registrationState.step1Data) {
      try {
        await loginMutation.mutateAsync({
          email: registrationState.step1Data.email,
          password: registrationState.step1Data.password,
        });
        // await fetchUser(); // Fetch user data after successful login
        await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });

        // Manually sync store
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = queryClient.getQueryData<any>(USER_QUERY_KEY);
        if (user) {
            useUserStore.getState().setUser(user);
        }

        // Merge guest cart with user cart
        await mergeGuestCart();

        toast.success("Registration completed! Welcome to Veracious!");
        router.push("/");
      } catch (error) {
        toast.success("Registration completed! Please log in to continue.");
        router.push("/auth/login");
      }
    } else {
      toast.success("Registration completed!");
      router.push("/auth/login");
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (registrationState.currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Step1Form onSuccess={handleStep1Success} />

            {/* Sign In Link for Step 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-slate-600">
                    Already have an account?
                  </span>
                </div>
              </div>
              <motion.button
                onClick={() => router.push("/auth/login")}
                className="mt-4 inline-flex items-center px-6 py-3 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Glasses className="w-4 h-4 mr-2" />
                Sign in to your account
              </motion.button>
            </motion.div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Step2Form
              userId={registrationState.userId!}
              email={registrationState.step1Data!.email}
              onSuccess={handleStep2Success}
              onBack={handleStep2Back}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Step3Form
              userId={registrationState.userId!}
              onSuccess={handleStep3Success}
              onSkip={handleStep3Skip}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Step1Form onSuccess={handleStep1Success} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-slate-600">
                    Already have an account?
                  </span>
                </div>
              </div>
              <motion.button
                onClick={() => router.push("/auth/login")}
                className="mt-4 inline-flex items-center px-6 py-3 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Glasses className="w-4 h-4 mr-2" />
                Sign in to your account
              </motion.button>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-200/30 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-gradient-to-r from-yellow-200/20 to-amber-300/20 rounded-full blur-2xl" />
      </div>

      {/* Creative Header Title Area */}
      <div className="relative z-10 pt-12 pb-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand Name */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Welcome to Veracious
            </span>
          </motion.h1>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Progress
              currentStep={registrationState.currentStep}
              totalSteps={3}
              labels={steps}
            />
          </motion.div>

          {/* Current Step Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {renderCurrentStep()}
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-slate-600">
                Step {registrationState.currentStep} of 3
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Support Link */}
      <motion.div
        className="relative z-10 text-center pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-sm text-slate-500">
          Need assistance?{" "}
          <a
            href="/support"
            className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2 transition-colors"
          >
            Contact our Support Team
          </a>
        </p>
      </motion.div>
    </div>
  );
};
