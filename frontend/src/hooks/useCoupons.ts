import { useQuery } from "@tanstack/react-query";
import {
  fetchCouponsByOrderValue,
  fetchCouponsForProduct,
} from "@/utils/couponsApi";

export const useProductCoupons = (productId?: string) => {
  return useQuery({
    queryKey: ["coupons", "product", productId],
    queryFn: () => fetchCouponsForProduct(productId as string),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCouponsByOrderValue = (orderValue?: number) => {
  return useQuery({
    queryKey: ["coupons", "orderValue", orderValue],
    queryFn: () => fetchCouponsByOrderValue(orderValue as number),
    enabled: typeof orderValue === "number" && orderValue > 0,
    staleTime: 1000 * 60 * 5,
  });
};
