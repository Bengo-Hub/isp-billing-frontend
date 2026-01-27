'use client';

import { useAuthStore } from '@/lib/store/auth';
import { PermissionAction, PermissionModule, Permission as RBACPermission, useRBACStore } from '@/lib/store/rbac';
import { useEffect } from 'react';

interface RBACProviderProps {
  children: React.ReactNode;
}

// Transform auth-store permissions (grouped or flat) to RBAC permissions format
export function transformPermissions(
  authPermissions: Array<{ module: string; actions?: string[]; action?: string }>
): RBACPermission[] {
  const rbacPermissions: RBACPermission[] = [];
  let idCounter = 1;

  for (const perm of authPermissions || []) {
    // If grouped (actions array)
    if (Array.isArray(perm.actions)) {
      for (const action of perm.actions) {
        rbacPermissions.push({
          id: idCounter++,
          module: perm.module as PermissionModule,
          action: action as PermissionAction,
        });
      }
    } else if (perm.action) {
      // Single-action entry from backend
      rbacPermissions.push({
        id: idCounter++,
        module: perm.module as PermissionModule,
        action: perm.action as PermissionAction,
      });
    }
  }

  return rbacPermissions;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { setUserRole, setUserPermissions, setLicence, resetRBAC } = useRBACStore();

  useEffect(() => {
    // Defensively handle cases where isAuthenticated may be true while user is not yet populated
    if (isAuthenticated && user) {
      // Safely set role (may be undefined) and permissions
      setUserRole((user as any)?.role ?? null);
      const rbacPermissions = transformPermissions((user as any)?.permissions ?? []);
      setUserPermissions(rbacPermissions);
      setLicence(null);
    } else {
      // Clear RBAC data when not authenticated or user missing
      resetRBAC();
    }
  }, [isAuthenticated, user, setUserRole, setUserPermissions, setLicence, resetRBAC]);

  return <>{children}</>;
}
