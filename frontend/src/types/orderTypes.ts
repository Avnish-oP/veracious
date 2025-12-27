// Order and checkout related types

export interface Address {
  id?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  label?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price?: number;
  discountPrice?: number;
  name?: string;
  image?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  addressId?: string;
  couponCode?: string;
  shipping?: number;
  gst?: number;
}

export interface RazorpayOrderDetails {
  key_id: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  razorpay: RazorpayOrderDetails;
  message?: string;
}

export interface VerifyOrderRequest {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyOrderResponse {
  success: boolean;
  message?: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  currency: string;
  paymentStatus: string;
  status: OrderStatus;
  addressId?: string;
  razorpayOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

// Razorpay types for window object
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}
