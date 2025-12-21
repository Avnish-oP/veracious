import {
  ApplyCouponRequestPayload,
  ApplyCouponResponse,
  CouponListResponse,
} from "@/types/couponsTypes";

import api from "../lib/axios";

async function couponApiCall<T>(
  endpoint: string,
  options: any = {}
): Promise<T> {
  try {
    const response = await api({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      ...options
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to process request");
  }
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
