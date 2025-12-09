import {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  RegistrationResponse,
  VerificationResponse,
  Step3Response,
  ApiError,
} from "@/types/registrationTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Generic API call function with proper error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Important for cookies
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`) as any;
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

// Step 1: Register user
export const registerUser = async (
  formData: Omit<Step1FormData, "confirmPassword">
): Promise<RegistrationResponse> => {
  return apiCall<RegistrationResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

// Step 2: Verify email
export const verifyUser = async (data: {
  userId: string;
  code: string;
}): Promise<VerificationResponse> => {
  return apiCall<VerificationResponse>("/auth/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Resend verification code
export const resendVerificationCode = async (data: {
  userId: string;
}): Promise<VerificationResponse> => {
  return apiCall<VerificationResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Step 3: Update optional fields
export const updateUserProfile = async (data: {
  userId: string;
  preferredStyle: string[];
  faceShape: string;
}): Promise<Step3Response> => {
  return apiCall<Step3Response>("/auth/register-step-2", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Login user (for after registration completion)
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<RegistrationResponse> => {
  return apiCall<RegistrationResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Forgot password - send reset email
export const forgotPassword = async (data: {
  email: string;
}): Promise<{ success: boolean; message: string }> => {
  return apiCall<{ success: boolean; message: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

// Reset password with token
export const resetPassword = async (data: {
  token: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  return apiCall<{ success: boolean; message: string }>(
    `/auth/reset-password?token=${data.token}`,
    {
      method: "POST",
      body: JSON.stringify({ newPassword: data.newPassword }),
    }
  );
};

// Fetch categories from backend
export const fetchCategories = async (): Promise<any> => {
  return apiCall<any>("/categories");
};
