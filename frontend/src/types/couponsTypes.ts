import { Product } from "./productTypes";

export type Decimal = number; // or string if you prefer to represent decimals as strings

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export interface RedeemedCoupon {
  id: string;
  couponId: string;
  userId: string;
  redeemedAt: string | Date;
  // add other redeemed coupon fields as needed
}

export interface Coupons {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discount: Decimal;
  discountValue?: Decimal;
  validFrom: string | Date;
  validTo?: string | Date;
  usageLimit?: number;
  perUserLimit?: number;
  minOrderValue?: Decimal;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  applicableProducts?: Product[]; // relation to products
  isForNewUsers: boolean;
  isForAllProducts: boolean;
  redeemedCoupons?: RedeemedCoupon[];
}

export interface CouponListResponse {
  success: boolean;
  coupons: Coupons[];
}

export interface ApplyCouponRequestPayload {
  code: string;
  orderValue: number;
  productIds: string[];
}

export interface ApplyCouponResponse {
  success: boolean;
  coupon: Coupons;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}
