"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RegistrationState, Step1FormData } from "@/types/registrationTypes";
import { useLoginMutation } from "@/hooks/useRegistration";
import { useUserStore } from "@/store/useUserStore";
import { useCart } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "@/hooks/useUser";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Form } from "./Step3Form";

export const RegistrationFlow: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLoginMutation();
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
        step1Data: { email: emailParam } as any,
      }));
    }
  }, [searchParams]);

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
    toast.success("Account created! Please check your email.");
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
    await completeRegistration();
  };

  // Step 3 Skip Handler
  const handleStep3Skip = async () => {
    await completeRegistration();
  };

  const completeRegistration = async () => {
    if (registrationState.step1Data) {
      try {
        await loginMutation.mutateAsync({
          email: registrationState.step1Data.email,
          password: registrationState.step1Data.password,
        });
        
        await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = queryClient.getQueryData<any>(USER_QUERY_KEY);
        if (user) {
            useUserStore.getState().setUser(user);
        }

        await mergeGuestCart();

        toast.success("Welcome aboard!");
        router.push("/");
      } catch {
        toast.success("Registration complete! Please log in.");
        router.push("/auth/login");
      }
    } else {
      toast.success("Registration complete!");
      router.push("/auth/login");
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (registrationState.currentStep) {
      case 1:
        return (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
              <p className="text-gray-600">Start your journey with premium eyewear</p>
            </div>
            
            <Step1Form onSuccess={handleStep1Success} />
            
            <div className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-amber-600 hover:text-amber-700">
                Sign in
              </Link>
            </div>
          </>
        );

      case 2:
        return (
          <>
             <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify email</h1>
              <p className="text-gray-600">We sent a code to <span className="font-medium text-gray-900">{registrationState.step1Data?.email}</span></p>
            </div>

            <Step2Form
              userId={registrationState.userId!}
              email={registrationState.step1Data!.email}
              onSuccess={handleStep2Success}
              onBack={handleStep2Back}
            />
          </>
        );

      case 3:
        return (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Personalize your style</h1>
              <p className="text-gray-600">Tell us what you like so we can recommend the best frames</p>
            </div>

            <Step3Form
              userId={registrationState.userId!}
              onSuccess={handleStep3Success}
              onSkip={handleStep3Skip}
            />
          </>
        );

      default:
        return null;
    }
  };

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
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Join the Vision
            </h1>
            <p className="text-slate-400 text-lg max-w-md mb-8">
              Create an account to access exclusive collections, track orders, and get personalized recommendations.
            </p>

            {/* Stepper Indicator on Left Panel */}
            <div className="flex gap-3 justify-center">
                {[1, 2, 3].map((step) => (
                    <div 
                        key={step} 
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            registrationState.currentStep >= step ? 'bg-amber-500 scale-110' : 'bg-slate-700'
                        }`}
                    />
                ))}
            </div>
          </motion.div>
        </div>
        
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
            key={registrationState.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
             {renderCurrentStep()}
          </motion.div>

          {/* Footer mobile */}
          <div className="lg:hidden mt-8 text-center text-sm text-gray-400">
             © 2026 Otticamart
          </div>
        </div>
      </div>
    </div>
  );
};
