'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    // Wait for Zustand persist to finish rehydrating from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      console.log('[AuthGuard] Hydration finished, validating token...');
      setHydrated(true);
    });

    // Check if already hydrated (for subsequent navigations)
    if (useAuthStore.persist.hasHydrated()) {
      console.log('[AuthGuard] Already hydrated');
      setHydrated(true);
    }

    return unsubscribe;
  }, []);

  // Validate token after hydration
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      
      console.log('[AuthGuard] Post-hydration check:', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
        userRole: user?.role,
      });

      // If authenticated but no token, validate with backend
      if (!token) {
        console.log('[AuthGuard] No token found, checking auth with backend...');
        setValidating(true);
        checkAuth().finally(() => setValidating(false));
      }
    }
  }, [hydrated, isAuthenticated, user, checkAuth]);

  // Handle redirect in useEffect to avoid React setState-in-render error
  useEffect(() => {
    if (hydrated && !isLoading && !validating && (!isAuthenticated || !user)) {
      console.log('[AuthGuard] Not authenticated, redirecting to login...', { isAuthenticated, hasUser: !!user });
      // All users login via the central login page
      router.replace('/login');
    }
  }, [hydrated, isLoading, validating, isAuthenticated, user, router]);

  // Show loading until store hydration completes and validation finishes
  if (!hydrated || isLoading || validating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || null;
  }

  // Normalize requiredRole (allow backend role names like `platform_owner`) and compare
  const normalizeRole = (role?: string) => {
    if (!role) return undefined;
    switch (role) {
      case 'platform_owner':
        return 'superuser';
      case 'isp_admin':
        return 'admin';
      case 'isp_technician':
        return 'technician';
      default:
        return role as any;
    }
  };

  const normalizedRequired = normalizeRole(requiredRole);

  // Check role requirement - only superuser can bypass all checks
  if (normalizedRequired && user?.role !== normalizedRequired && user?.role !== 'superuser') {
    console.log('[AuthGuard] Role check failed:', {
      required: normalizedRequired,
      userRole: user?.role,
      redirecting: true,
    });

    // Redirect users to their appropriate dashboard based on role
    // Note: We already know user is not superuser due to check on line 99
    const { organizationInfo, customerPortalInfo } = useAuthStore.getState();

    // Customers should go to their portal, not the ISP dashboard
    if (user?.role === 'customer' && customerPortalInfo?.portal_url) {
      router.push(customerPortalInfo.portal_url);
    } else if (organizationInfo?.organization_slug) {
      // ISP users (admin, technician) go to dashboard
      router.push(`/${organizationInfo.organization_slug}/dashboard`);
    } else {
      // Fallback to login if no org context
      router.push('/login');
    }
    return fallback || null;
  }

  return <>{children}</>;
}
