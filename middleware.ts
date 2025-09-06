import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For debugging purposes, let's be less aggressive with middleware
  // and primarily rely on client-side protection for now
  
  // Only handle specific cases in middleware
  
  // If user is on auth page and has any potential session cookie, redirect to dashboard
  if (pathname === '/auth') {
    // Check for various possible session cookie names that Better Auth might use
    const possibleCookieNames = [
      'better-auth.session_token',
      'better-auth.session',
      'session_token',
      'session',
      'auth.session_token',
      'auth-token'
    ];

    let hasValidSession = false;

    for (const cookieName of possibleCookieNames) {
      const cookie = request.cookies.get(cookieName);
      if (cookie && cookie.value && cookie.value.length > 10) { // Basic validation
        hasValidSession = true;
        break;
      }
    }

    if (hasValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
