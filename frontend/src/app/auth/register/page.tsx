"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { RegistrationFlow } from "@/components/registration/RegistrationFlow";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useUserStore();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationFlow />
    </Suspense>
  );
}
