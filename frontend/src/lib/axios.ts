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
        // Only attempt refresh if user was previously authenticated
        // (i.e., they have a session that expired, not a first-time visitor)
        if (!wasAuthenticated) {
          // User was never logged in — 401 is expected, don't redirect
          return Promise.reject(error);
        }

        // The backend expects the refresh token in cookies
        await api.post("/auth/refresh-token");

        // If refresh succeeded, retry the original request
        return api(originalRequest);
      } catch {
        // Refresh failed — both tokens are invalid, clear auth state
        setAuthenticated(false);

        // Only redirect to login if user had an active session that expired
        // Don't redirect guest users who were never logged in
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
