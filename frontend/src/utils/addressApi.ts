import api from "../lib/axios";
import { Address } from "@/types/orderTypes";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get("/address");
  return response.data;
};

export const addAddress = async (address: Partial<Address>): Promise<Address> => {
  const response = await api.post("/address/add", address);
  return response.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/address/${id}`);
};
