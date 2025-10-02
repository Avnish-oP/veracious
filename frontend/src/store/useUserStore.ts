import { create } from "zustand";
import axios from "axios";
import { ensureAccessToken } from "@/utils/refreshToken";

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
      await ensureAccessToken();
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/auth/me",
        { withCredentials: true }
      );
      console.log("Fetched user:", response.data.user);
      set({ user: response.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    set({ user: null, loading: false });
  },
}));
