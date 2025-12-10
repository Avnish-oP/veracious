import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ProductsResponse } from '@/types/product';

interface UseProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useProducts = ({ page = 1, limit = 10, search = '' }: UseProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', page, limit, search],
    queryFn: async () => {
      // Intentionally using the new Admin-specific endpoint
      const { data } = await api.get<ProductsResponse>('/admin/products', {
        params: { page, limit, search },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};
