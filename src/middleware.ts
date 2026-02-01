import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/contact',
  '/payment/callback',
  '/hotspot',
  '/pppoe',
  '/portal',
  '/buy-packages',
];

// Platform-only routes (require platform_owner role)
const PLATFORM_ROUTES = [
  '/platform',
];

// Routes that require authentication but any authenticated user can access
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/users',
  '/packages',
  '/payments',
  '/routers',
  '/reports',
  '/settings',
  '/billing',
  '/sms',
  '/leads',
  '/tickets',
  '/logs',
  '/messages',
  '/security',
  '/ip-bindings',
  '/shop',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get auth token from cookies or localStorage (Next.js middleware can only read cookies)
  const authToken = request.cookies.get('auth-token')?.value;

  // If no auth token, redirect to login
  if (!authToken) {
    // For API routes or protected pages without auth, redirect to login
    if (!pathname.startsWith('/login')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Platform route protection
  if (PLATFORM_ROUTES.some(route => pathname.startsWith(route))) {
    // Note: We can't read localStorage in middleware (server-side)
    // We'll rely on client-side AuthGuard for role checking
    // But we can at least ensure they're authenticated
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Dashboard route protection - require authentication
  if (DASHBOARD_ROUTES.some(route => pathname.startsWith(route))) {
    if (!authToken) {
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
