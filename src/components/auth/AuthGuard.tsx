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
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand persist to finish rehydrating from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Check if already hydrated (for subsequent navigations)
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsubscribe;
  }, []);

  // Show loading until store hydration completes
  if (!hydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.replace('/login');
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

  // Be defensive: user may be temporarily undefined during hydration
  if (normalizedRequired && (user?.role ?? undefined) !== normalizedRequired && (user?.role ?? undefined) !== 'admin') {
    router.push('/unauthorized');
    return fallback || null;
  }

  return <>{children}</>;
}
