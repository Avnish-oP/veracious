export async function ensureAccessToken() {
  // Just call refresh endpoint to ensure token is fresh
  // This is more efficient than calling /auth/me first
  try {
    const refreshRes = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/auth/refresh-token",
      { method: "POST", credentials: "include" }
    );
    if (!refreshRes.ok) {
      throw new Error("Session expired. Please log in again.");
    }
  } catch (error) {
    throw new Error("Session expired. Please log in again.");
  }
}
