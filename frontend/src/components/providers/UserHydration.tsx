"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function UserHydration() {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return null;
}
