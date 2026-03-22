import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { setAuthenticated } from "../lib/axios";
import { AxiosError } from "axios";
import { User } from "@/types/userTypes";
import { useUserStore } from "@/store/useUserStore";

export const USER_QUERY_KEY = ["user"];

// Fetch current user
const fetchUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/me");
    return response.data.user;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      return null;
    }
    // For other errors, return null to avoid breaking the app
    return null;
  }
};

// Logout API call
const logoutUser = async () => {
  await api.post("/auth/logout");
};

export function useUser() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser); // Sync to store

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 30, // 30 minutes (User session rarely changes)
    retry: 1, // Don't retry too much for auth
    refetchOnWindowFocus: false, // Avoid refetching on every focus
  });

  // Sync React Query data → Zustand store on every change
  useEffect(() => {
    if (user !== undefined) {
      setUser(user ?? null);
    }
  }, [user, setUser]);

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear authenticated state for axios interceptor
      setAuthenticated(false);
      // Clear Query Cache
      queryClient.setQueryData(USER_QUERY_KEY, null);
      // Clear Store
      setUser(null);
      // Clear Cart Store via window reload or let it handle itself?
      // Ideally CartStore listens to user changes or we manually clear it.
      // But clearing user triggers CartStore checks.
    },
  });

  return {
    user: user ?? null, // Ensure null if undefined
    isLoading,
    isError,
    error,
    logout: logoutMutation.mutateAsync,
  };
}
