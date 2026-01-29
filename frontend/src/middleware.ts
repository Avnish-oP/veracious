import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // User is authenticated if they have refresh token
  const hasAuthTokens = Boolean(refreshToken);

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/orders",
    "/wishlist",
    "/checkout",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow all non-protected routes (homepage, products, etc.)
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users from protected routes
  if (!hasAuthTokens) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
  ],
};
