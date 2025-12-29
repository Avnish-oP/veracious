import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1",
  withCredentials: true,
});

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/verify",
  "/categories",
  "/products",
];

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
// Track if user was authenticated (set when login succeeds, cleared on logout)
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

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb(""));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if no config (shouldn't happen, but safety check)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      originalRequest.url?.includes(route)
    );

    // Skip auth routes to prevent loops
    const isAuthRoute = originalRequest.url?.includes("/auth/");

    // Only attempt refresh if:
    // 1. Got 401 error
    // 2. Haven't already retried
    // 3. Not a public route
    // 4. Not an auth route
    // 5. User was previously authenticated (has logged in before)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicRoute &&
      !isAuthRoute &&
      wasAuthenticated
    ) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Clear authenticated state since refresh failed
        setAuthenticated(false);

        // Only redirect if in browser and not already on login page
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/login")
        ) {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
