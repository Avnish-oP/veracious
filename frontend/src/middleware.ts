import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const _accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Consider user potentially authenticated if they have refresh token
  // Access token may be expired, but refresh token allows re-authentication
  const hasAuthTokens = Boolean(refreshToken);

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/orders",
    "/wishlist",
    "/cart",
  ];

  // Define auth routes
  const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const _isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  // Only redirect if NO tokens exist at all
  if (isProtectedRoute && !hasAuthTokens) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // DON'T redirect authenticated users from auth routes in middleware
  // Let the client-side handle this after verifying tokens are valid
  // This prevents redirect loops when tokens exist but are invalid/expired

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/cart/:path*",
    "/auth/:path*",
  ],
};
