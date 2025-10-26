'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'technician' | 'user';
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { isAuthenticated, user, checkAuth, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push('/auth/login');
    return fallback || null;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    router.push('/unauthorized');
    return fallback || null;
  }

  return <>{children}</>;
}
