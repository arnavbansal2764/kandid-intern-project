import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/leads', '/campaigns', '/settings'];
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Check for session cookie (better-auth uses this cookie name)
    const sessionCookie = request.cookies.get('better-auth.session_token') || 
                         request.cookies.get('session_token') ||
                         request.cookies.get('better-auth.session');
    
    if (!sessionCookie) {
      // Redirect to auth page if no session, preserving the intended destination
      const url = new URL('/auth', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // If user is already authenticated and visits auth page, redirect to dashboard
  if (pathname === '/auth') {
    const sessionCookie = request.cookies.get('better-auth.session_token') || 
                         request.cookies.get('session_token') ||
                         request.cookies.get('better-auth.session');
    
    if (sessionCookie) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
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
