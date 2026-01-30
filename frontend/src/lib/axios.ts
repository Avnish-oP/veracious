import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  withCredentials: true,
});

// Track if user was authenticated (for UI state management)
let wasAuthenticated = false;

export const setAuthenticated = (value: boolean) => {
  wasAuthenticated = value;
  if (typeof window !== "undefined") {
    if (value) {
      localStorage.setItem("wasAuthenticated", "true");
    } else {
      localStorage.removeItem("wasAuthenticated");
    }
  }
};

// Initialize from localStorage on load
if (typeof window !== "undefined") {
  wasAuthenticated = localStorage.getItem("wasAuthenticated") === "true";
}

// Simple interceptor - backend handles token refresh automatically
// This just tracks authentication state for UI purposes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, clear the authenticated state
    // The backend already tried to refresh, so if we still got 401,
    // both tokens are invalid
    if (error.response?.status === 401) {
      setAuthenticated(false);
    }
    return Promise.reject(error);
  },
);

export default api;
