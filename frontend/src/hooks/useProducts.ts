import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  Product,
  ProductsResponse,
  FeaturedProductsResponse,
  ProductFilters,
} from "@/types/productTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Generic API call function
async function apiCall<T>(
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
    throw new Error(data.message || data.error || "An error occurred");
  }

  return data;
}

// Fetch all products with pagination and filtering
export const fetchProducts = async ({
  page = 1,
  limit = 10,
  search,
  category,
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
} = {}): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (category) params.append("category", category);

  const queryString = params.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

  return apiCall<ProductsResponse>(endpoint);
};

// Fetch featured products
export const fetchFeaturedProducts = async (
  limit: number = 8
): Promise<FeaturedProductsResponse> => {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());

  return apiCall<FeaturedProductsResponse>(`/products/featured?${params}`);
};

// Fetch product by ID
export const fetchProductById = async (productId: string): Promise<Product> => {
  return apiCall<Product>(`/products/${productId}`);
};

// Fetch products by category
export const fetchProductsByCategory = async (
  categoryId: string
): Promise<ProductsResponse> => {
  return apiCall<ProductsResponse>(`/products/category/${categoryId}`);
};

// React Query Hooks

// Hook for fetching all products
export const useProducts = ({
  page = 1,
  limit = 10,
  search,
  category,
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
} = {}) => {
  return useQuery({
    queryKey: ["products", { page, limit, search, category }],
    queryFn: () => fetchProducts({ page, limit, search, category }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching featured products
export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes for featured products
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching products by category
export const useProductsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: () => fetchProductsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Search products hook with debouncing
export const useProductSearch = (
  searchTerm: string,
  debounceMs: number = 300
) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  return useQuery({
    queryKey: ["products", "search", debouncedSearchTerm],
    queryFn: () => fetchProducts({ search: debouncedSearchTerm }),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
};

// Prefetch products for better UX
export const usePrefetchProducts = () => {
  const queryClient = useQueryClient();

  const prefetchFeaturedProducts = () => {
    queryClient.prefetchQuery({
      queryKey: ["products", "featured", 8],
      queryFn: () => fetchFeaturedProducts(8),
      staleTime: 1000 * 60 * 10,
    });
  };

  const prefetchProducts = (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
    } = {}
  ) => {
    queryClient.prefetchQuery({
      queryKey: ["products", params],
      queryFn: () => fetchProducts(params),
      staleTime: 1000 * 60 * 5,
    });
  };

  return {
    prefetchFeaturedProducts,
    prefetchProducts,
  };
};
