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

// Interceptor with token refresh retry — matches admin panel behavior.
// On 401, attempt to refresh the token and retry the original request.
// Only gives up and clears auth state if the refresh itself fails.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried refreshing yet, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // The backend expects the refresh token in cookies
        await api.post("/auth/refresh-token");

        // If refresh succeeded, retry the original request
        return api(originalRequest);
      } catch {
        // Refresh failed — both tokens are invalid, clear auth state
        setAuthenticated(false);

        // Redirect to login if not already there
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/login")
        ) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
