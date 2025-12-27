import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  Product,
  ProductsResponse,
  FeaturedProductsResponse,
} from "@/types/productTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

import { ExtendedApiError } from "@/utils/api";

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
export const fetchFeaturedProducts = async ({
  page = 1,
  limit = 8,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<FeaturedProductsResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  return apiCall<FeaturedProductsResponse>(`/products/featured?${params}`);
};

// Fetch product by ID
export const fetchProductById = async (
  productId: string
): Promise<{ success: boolean; product: Product }> => {
  return apiCall<{ success: boolean; product: Product }>(
    `/products/${productId}`
  );
};

// Hook for fetching a single product by ID
export const useProductDetail = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: ExtendedApiError) => {
      if (
        error?.status === 404 ||
        (error?.status && error.status >= 400 && error.status < 500)
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Fetch products by category
export const fetchProductsByCategory = async ({
  categoryId,
  page = 1,
  limit = 10,
}: {
  categoryId: string;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  return apiCall<ProductsResponse>(
    `/products/category/${categoryId}?${params}`
  );
};

// Fetch trending products
export const fetchTrendingProducts = async ({
  page = 1,
  limit = 8,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  return apiCall<ProductsResponse>(`/products/trending?${params}`);
};

// React Query Hooks

// Hook for fetching all products
export const useProducts = ({
  page = 1,
  limit = 10,
  search,
  category,
  gender,
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  gender?: string;
} = {}) => {
  return useQuery({
    queryKey: ["products", { page, limit, search, category, gender }],
    queryFn: () => fetchProducts({ page, limit, search, category }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: ExtendedApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching featured products
export const useFeaturedProducts = ({
  page = 1,
  limit = 8,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ["products", "featured", page, limit],
    queryFn: () => fetchFeaturedProducts({ page, limit }),
    staleTime: 1000 * 60 * 10, // 10 minutes for featured products
    retry: (failureCount, error: ExtendedApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
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
    retry: (failureCount, error: ExtendedApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching products by category
export const useProductsByCategory = ({
  categoryId,
  page = 1,
  limit = 10,
}: {
  categoryId: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["products", "category", categoryId, page, limit],
    queryFn: () => fetchProductsByCategory({ categoryId, page, limit }),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: ExtendedApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching trending products
export const useTrendingProducts = ({
  page = 1,
  limit = 8,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ["products", "trending", page, limit],
    queryFn: () => fetchTrendingProducts({ page, limit }),
    staleTime: 1000 * 60 * 10, // 10 minutes for trending products
    retry: (failureCount, error: ExtendedApiError) => {
      if (error?.status && error.status >= 400 && error.status < 500) {
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
      queryFn: () => fetchFeaturedProducts({ limit: 8 }),
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
