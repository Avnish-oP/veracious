"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";

const ConditionalNavbar = () => {
  const pathname = usePathname();

  // Hide navbar on authentication routes
  const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify",
  ];

  const shouldHideNavbar = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideNavbar) {
    return null;
  }

  return <Navbar />;
};

export default ConditionalNavbar;
