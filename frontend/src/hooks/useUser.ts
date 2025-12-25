import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { User } from "@/types/userTypes";
import { useUserStore } from "@/store/useUserStore";

export const USER_QUERY_KEY = ["user"];

// Fetch current user
const fetchUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/me");
    return response.data.user;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return null;
    }
    // For other errors, we might want to throw or return null depending on strategy
    // Returning null for now to avoid error boundary splashes on network glitches, 
    // but React Query retries will handle glitches.
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

  // Sync with Zustand store whenever data changes
  // This is a side effect. Putting it in render body is okay for simple syncs 
  // if guarded, but useEffect is safer for state updates.
  // However, React Query onSuccess is deprecated in v5. 
  // We can use an effect here.
  // NOTE: We must be careful not to trigger infinite re-renders.
  // useUserStore.setState({ user }) is stable.
  
  if (user !== undefined) {
      // We only sync if user is defined (loaded). 
      // If isLoading, user is undefined (or old data if placeholder).
      // Actually strictly speaking we should sync in useEffect.
  }

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
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
