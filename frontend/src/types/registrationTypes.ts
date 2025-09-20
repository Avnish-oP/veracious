import { z } from "zod";

// Step 1: Basic registration schema
export const step1Schema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be less than 15 digits")
      .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Step 2: Verification schema
export const step2Schema = z.object({
  verificationCode: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

// Step 3: Optional fields schema
export const step3Schema = z.object({
  faceShape: z
    .enum([
      "ROUND",
      "OVAL",
      "SQUARE",
      "RECTANGLE",
      "HEART",
      "DIAMOND",
      "TRIANGLE",
      "OBLONG",
    ])
    .optional(),
  preferredStyles: z.array(z.string()).optional(),
});

// Type definitions
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;

// Registration flow types
export interface RegistrationState {
  currentStep: 1 | 2 | 3;
  userId?: string;
  step1Data?: Omit<Step1FormData, "confirmPassword">;
  step2Data?: Step2FormData;
  step3Data?: Step3FormData;
}

// API response types
export interface RegistrationResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    isVerified: boolean;
    verificationCode?: string;
  };
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}

export interface Step3Response {
  success: boolean;
  message: string;
  user: any;
}

// Error response type
export interface ApiError {
  success: false;
  message: string;
}
