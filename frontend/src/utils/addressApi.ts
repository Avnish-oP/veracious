import { Address } from "@/types/orderTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await fetch(`${API_BASE_URL}/address`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch addresses");
  return response.json();
};

export const addAddress = async (address: Partial<Address>): Promise<Address> => {
  const response = await fetch(`${API_BASE_URL}/address/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to add address");
  return response.json();
};

export const deleteAddress = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/address/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete address");
};
