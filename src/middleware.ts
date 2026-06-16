import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/staff-login',
  '/contact',
  '/payment/callback',
  '/auth/callback', // Codevertex SSO callback (token exchange happens client-side here)
  '/buy', // Captive portal package purchase page (/buy/[orgSlug])
];

// Platform-only routes (require platform_owner role)
const PLATFORM_ROUTES = [
  '/platform',
];

// Protected route segments that require authentication (can appear anywhere in path)
const PROTECTED_SEGMENTS = [
  'dashboard',
  'portal', // Customer portals (/[org]/portal/hotspot, /[org]/portal/pppoe)
  'users',
  'packages',
  'payments',
  'routers',
  'reports',
  'settings',
  'billing',
  'sms',
  'leads',
  'tickets',
  'logs',
  'messages',
  'security',
  'ip-bindings',
  'shop',
  'campaigns',
  'emails',
  'expenses',
  'vouchers',
  'support',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    // Exact match or starts with (for nested public routes)
    return pathname === route || pathname.startsWith(route + '/');
  });
}

function isProtectedRoute(pathname: string): boolean {
  // Split path into segments
  const segments = pathname.split('/').filter(Boolean);

  // Check if any segment matches protected segments
  // This handles both /dashboard and /{org}/dashboard patterns
  return PROTECTED_SEGMENTS.some(protectedSegment =>
    segments.includes(protectedSegment)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const authToken = request.cookies.get('auth-token')?.value;

  // Debug logging
  const allCookies = request.cookies.getAll();
  console.log('[Middleware] Auth check:', {
    pathname,
    hasAuthToken: !!authToken,
    authTokenLength: authToken?.length,
    allCookieNames: allCookies.map(c => c.name),
    isProtected: isProtectedRoute(pathname),
    isPlatform: PLATFORM_ROUTES.some(route => pathname.startsWith(route)),
  });

  // Platform route protection
  if (PLATFORM_ROUTES.some(route => pathname.startsWith(route))) {
    if (!authToken) {
      console.log('[Middleware] Redirecting to login: Platform route without token');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protected route check (handles both /dashboard and /{org}/dashboard)
  if (isProtectedRoute(pathname)) {
    if (!authToken) {
      console.log('[Middleware] Redirecting to login: Protected route without token');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sw.js|workbox-.*.js).*)',
  ],
};
