import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

// UX fast-path only — a cheap cookie-presence check to redirect signed-out
// users before they even reach a protected route. This is NOT the security
// boundary; real verification always happens server-side via
// getServerSession() in every protected layout/route.
const PROTECTED_PREFIXES = ['/dashboard', '/analytics', '/equity', '/engagement', '/settings', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected) {
    const hasCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analytics/:path*', '/equity/:path*', '/engagement/:path*', '/settings/:path*', '/admin/:path*'],
};
