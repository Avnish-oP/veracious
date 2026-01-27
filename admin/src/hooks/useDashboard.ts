import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface DashboardStats {
  orders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
  };
  totalProducts: number;
  totalCustomers: number;
}

interface TopProduct {
  id: string;
  name: string;
  price: number;
  image: string | null;
  reviewCount: number;
}

interface RecentOrder {
  id: string;
  finalAmount: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
}

interface LowStockProduct {
  id: string;
  name: string;
  image: string | null;
  stock: number;
}

interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/admin/dashboard');
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};
