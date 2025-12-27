import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrders,
  fetchAddresses,
  addAddress,
  deleteAddress,
} from "@/utils/api";
import { toast } from "react-hot-toast";

// Hook to fetch orders
export const useOrdersQuery = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: any) => data.orders,
  });
};

// Hook to fetch addresses
export const useAddressesQuery = () => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // API returns the array directly
    select: (data) => data,
  });
};

// Hook to add address
export const useAddAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add address");
    },
  });
};

// Hook to delete address
export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });
};
