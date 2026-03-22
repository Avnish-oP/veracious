import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin route protection middleware.
 * Redirects unauthenticated users to /login when accessing /dashboard routes.
 * 
 * Note: This only checks for token *presence* — true role verification
 * happens at the API layer via the backend adminMiddleware.
 * This prevents the admin UI from rendering for unauthenticated users.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');

  // If no access token and trying to access dashboard, redirect to login
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has token and on login page, redirect to dashboard
  if (token && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
