import { create } from "zustand";
import axios from "axios";
import { ensureAccessToken } from "@/utils/refreshToken";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
      console.log("🔄 Fetching user from:", `${API_URL}/auth/me`);

      // First ensure we have a valid access token
      await ensureAccessToken();

      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
      });

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
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
    set({ user: null, loading: false });
  },
}));
