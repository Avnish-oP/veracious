import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

// Types
export interface OrderUser {
  id: string;
  name: string;
  email: string;
}

export interface Order {
  id: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
  user: OrderUser | null;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const useOrders = ({
  page = 1,
  limit = 10,
  status = '',
  search = '',
  startDate = '',
  endDate = '',
}: UseOrdersParams = {}) => {
  return useQuery({
    queryKey: ['admin-orders', page, limit, status, search, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const { data } = await api.get<OrdersResponse>(`/admin/orders?${params.toString()}`);
      return data;
    },
  });
};

// Order Details types
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  configuration?: {
    lensType?: string;
    lensColor?: string;
  };
}

export interface OrderAddress {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface OrderCoupon {
  code: string;
  discountType: string;
  discount: number;
}

export interface OrderPayment {
  id: string;
  paymentId: string | null;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetails extends Order {
  currency: string;
  paymentMethod: string | null;
  items: OrderItem[];
  updatedAt: string;
  user: (OrderUser & { phoneNumber: string | null }) | null;
  address: OrderAddress | null;
  coupon: OrderCoupon | null;
  payments: OrderPayment[];
}

export interface OrderDetailsResponse {
  success: boolean;
  order: OrderDetails;
}

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderDetailsResponse>(`/admin/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
};

// Update order status mutation
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data } = await api.put(`/admin/orders/${orderId}`, { status });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and details
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', variables.orderId] });
    },
  });
};
