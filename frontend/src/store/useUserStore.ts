import { create } from "zustand";
import api from "../lib/axios";

// Define the User type or import it from the appropriate module
interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  faceShape: string;
  preferredStyles: string[];
}

interface UserState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchUser: async () => {
    set({ loading: true });
    try {
      console.log("🔄 Fetching user from: /auth/me");

      const response = await api.get("/auth/me");

      console.log("✅ User fetched successfully:", response.data.user);
      set({ user: response.data.user, loading: false });
    } catch (error: any) {
      console.error(
        "❌ Error fetching user:",
        error.response?.data || error.message
      );
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
    set({ user: null, loading: false });
  },
}));
