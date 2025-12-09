const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function ensureAccessToken() {
  // Just call refresh endpoint to ensure token is fresh
  // This is more efficient than calling /auth/me first
  try {
    console.log("🔄 Refreshing access token...");
    const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      console.error("❌ Failed to refresh token:", refreshRes.status);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    console.log("✅ Access token refreshed successfully");
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    throw new Error("Session expired. Please log in again.");
  }
}
