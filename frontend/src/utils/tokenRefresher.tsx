"use client";

import { useEffect } from "react";

export default function TokenRefresher() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {
        // Optionally handle error (e.g. logout user)
      }
    }, 10 * 60 * 1000); // every 10 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
}
