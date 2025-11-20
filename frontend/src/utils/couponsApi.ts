import {
  ApplyCouponRequestPayload,
  ApplyCouponResponse,
  CouponListResponse,
} from "@/types/couponsTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function couponApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to process request");
  }

  return data;
}

export const fetchCouponsForProduct = async (
  productId: string
): Promise<CouponListResponse> => {
  if (!productId) {
    throw new Error("Product ID is required to fetch coupons");
  }

  return couponApiCall<CouponListResponse>(`/coupons/${productId}`);
};

export const fetchCouponsByOrderValue = async (
  orderValue: number
): Promise<CouponListResponse> => {
  if (!orderValue || Number.isNaN(orderValue)) {
    throw new Error("Valid order value is required");
  }

  const params = new URLSearchParams({ orderValue: orderValue.toString() });
  return couponApiCall<CouponListResponse>(
    `/coupons/by-order-value?${params.toString()}`
  );
};

export const applyCouponCodeApi = async (
  payload: ApplyCouponRequestPayload
): Promise<ApplyCouponResponse> => {
  return couponApiCall<ApplyCouponResponse>("/coupons/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
