"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useUser } from "@/hooks/useUser";

export default function UserHydration() {
  const setUser = useUserStore((state) => state.setUser);
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
        // If loading is done, sync the result (user or null) to the store
        setUser(user);
    }
  }, [user, isLoading, setUser]);

  return null;
}
