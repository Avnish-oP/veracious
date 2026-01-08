import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Assuming public endpoint /categories lists all active categories
      const { data } = await api.get<CategoriesResponse>('/categories');
      return data.categories;
    },
  });
};
