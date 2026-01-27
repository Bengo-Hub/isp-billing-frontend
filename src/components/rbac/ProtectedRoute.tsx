import { useAuthStore } from '@/lib/store/auth';
import { PermissionAction, PermissionModule, usePermissions, UserRole } from '@/lib/store/rbac';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  module?: PermissionModule;
  action?: PermissionAction;
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  module,
  action,
  roles,
  requireAll = false,
  fallback = null,
  redirectTo = '/dashboard',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { hasPermission, hasRole, isSuperuser } = usePermissions();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Superuser bypasses all checks
  if (isSuperuser()) {
    return <>{children}</>;
  }

  let hasAccess = true;

  // Check module/action permissions
  if (module && action) {
    hasAccess = hasPermission(module, action);
  }

  // Check role permissions
  if (roles && roles.length > 0) {
    const roleCheck = hasRole(roles);
    if (requireAll) {
      hasAccess = hasAccess && roleCheck;
    } else {
      hasAccess = hasAccess || roleCheck;
    }
  }

  // Redirect if no access
  if (!hasAccess) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common route protection
export function AdminRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute roles={['admin', 'superuser']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function SuperuserRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute roles={['superuser']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function TechnicianRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute roles={['technician', 'admin', 'superuser']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Module-specific route protection
export function UserManagementRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="users" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function PackageManagementRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="packages" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function RouterManagementRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="routers" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function ProvisioningRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="provisioning" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function PaymentManagementRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="payments" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function SMSManagementRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="sms" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function SettingsRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="settings" action="update" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function SystemConfigRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="system_config" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function ReportsRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="reports" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function BackupRestoreRoute({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute module="backup_restore" action="manage" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
