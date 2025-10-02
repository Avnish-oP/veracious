import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerUser,
  verifyUser,
  resendVerificationCode,
  updateUserProfile,
  loginUser,
  forgotPassword,
  resetPassword,
} from "@/utils/api";
import {
  Step1FormData,
  RegistrationResponse,
  VerificationResponse,
  Step3Response,
} from "@/types/registrationTypes";
import { toast } from "react-hot-toast";

// Step 1: Registration mutation
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: Omit<Step1FormData, "confirmPassword">) =>
      registerUser(data),
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });
};

// Step 2: Verification mutation
export const useVerifyMutation = () => {
  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) =>
      verifyUser({ userId, code }),
    onError: (error: Error) => {
      toast.error(error.message || "Verification failed");
    },
  });
};

// Resend verification code mutation
export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      resendVerificationCode({ userId }),
    onSuccess: () => {
      toast.success("Verification code sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend verification code");
    },
  });
};

// Step 3: Profile update mutation
export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: ({
      userId,
      preferredStyle,
      faceShape,
    }: {
      userId: string;
      preferredStyle: string[];
      faceShape: string;
    }) => updateUserProfile({ userId, preferredStyle, faceShape }),
    onError: (error: Error) => {
      toast.error(error.message || "Profile update failed");
    },
  });
};

// Login mutation (for after registration)
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser({ email, password }),
    onSuccess: () => {
      // Invalidate and refetch user data after login
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Login successful!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });
};

// Forgot password mutation
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => forgotPassword(data),
    onSuccess: () => {
      toast.success(
        "If an account with this email exists, you'll receive password reset instructions."
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
};

// Reset password mutation
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      resetPassword(data),
    onSuccess: () => {
      toast.success(
        "Password reset successfully! You can now log in with your new password."
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
};
