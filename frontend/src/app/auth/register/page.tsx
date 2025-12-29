"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { RegistrationFlow } from "@/components/registration/RegistrationFlow";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationFlow />
    </Suspense>
  );
}
