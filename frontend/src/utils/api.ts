import {
  Step1FormData,
  RegistrationResponse,
  VerificationResponse,
  Step3Response,
} from "@/types/registrationTypes";
import { AxiosRequestConfig } from "axios";

export interface ExtendedApiError extends Error {
  status?: number;
  data?: unknown;
}

export interface ApiCallConfig extends AxiosRequestConfig {
  body?: string;
}

import api from "../lib/axios";

// Generic API call function with proper error handling
async function apiCall<T>(
  endpoint: string,
  options: ApiCallConfig = {}
): Promise<T> {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      ...options
    });
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const customError = new Error(error.response?.data?.message || error.message || "An error occurred") as ExtendedApiError;
    customError.data = error.response?.data;
    customError.status = error.response?.status;
    throw customError;
  }
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
export const fetchCategories = async (): Promise<unknown> => {
  return apiCall<unknown>("/categories");
};

// Fetch user orders
export const fetchOrders = async (): Promise<unknown> => {
  return apiCall<unknown>("/orders");
};

// Fetch single order by ID
export const fetchOrderById = async (orderId: string): Promise<unknown> => {
  return apiCall<unknown>(`/orders/${orderId}`);
};

// Fetch user addresses
export const fetchAddresses = async (): Promise<unknown> => {
  return apiCall<unknown>("/address");
};

// Add new address
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addAddress = async (data: any): Promise<unknown> => {
  return apiCall<unknown>("/address/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Delete address
export const deleteAddress = async (id: string): Promise<unknown> => {
  return apiCall<unknown>(`/address/${id}`, {
    method: "DELETE",
  });
};

// Download Invoice
export const downloadInvoice = async (orderId: string): Promise<void> => {
  try {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice_${orderId.slice(-8).toUpperCase()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Failed to download invoice:", error);
    throw error;
  }
};
