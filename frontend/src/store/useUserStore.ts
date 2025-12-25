import { create } from "zustand";
import api from "../lib/axios";
import { User } from "@/types/userTypes";

interface UserState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  // fetchUser: () => Promise<void>; // Deprecated
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  // fetchUser is now handled by React Query (useUser hook) + UserHydration
  fetchUser: async () => {}, 

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
