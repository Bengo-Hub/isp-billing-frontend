'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRBACStore } from '@/lib/store/rbac';
import { useEffect } from 'react';

interface RBACProviderProps {
  children: React.ReactNode;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { setUserRole, setUserPermissions, setLicence, resetRBAC } = useRBACStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Update RBAC store with user data
      setUserRole(user.role);
      setUserPermissions(user.permissions || []);
      setLicence(user.licence || null);
    } else {
      // Clear RBAC data when not authenticated
      resetRBAC();
    }
  }, [isAuthenticated, user, setUserRole, setUserPermissions, setLicence, resetRBAC]);

  return <>{children}</>;
}
