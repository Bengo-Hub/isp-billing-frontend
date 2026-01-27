import { PermissionAction, PermissionModule, usePermissions, UserRole } from '@/lib/store/rbac';
import { ReactNode } from 'react';

interface PermissionGateProps {
  children: ReactNode;
  module?: PermissionModule;
  action?: PermissionAction;
  resource?: string;
  roles?: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have all specified permissions/roles
}

export function PermissionGate({
  children,
  module,
  action,
  resource,
  roles,
  fallback = null,
  requireAll = false,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasRole,
    isSuperuser,
  } = usePermissions();

  // Superuser bypasses all checks
  if (isSuperuser()) {
    return <>{children}</>;
  }

  let hasAccess = true;

  // Check module/action permissions
  if (module && action) {
    hasAccess = hasPermission(module, action, resource);
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

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common permission checks
interface ModuleAccessProps {
  children: ReactNode;
  module: PermissionModule;
  action?: PermissionAction;
  fallback?: ReactNode;
}

export function ModuleAccess({ children, module, action = 'read', fallback = null }: ModuleAccessProps) {
  return (
    <PermissionGate module={module} action={action} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

interface RoleAccessProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function RoleAccess({ children, roles, fallback = null, requireAll = false }: RoleAccessProps) {
  return (
    <PermissionGate roles={roles} fallback={fallback} requireAll={requireAll}>
      {children}
    </PermissionGate>
  );
}

// Specific role components
export function SuperuserOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleAccess roles={['superuser']} fallback={fallback}>{children}</RoleAccess>;
}

export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleAccess roles={['admin', 'superuser']} fallback={fallback}>{children}</RoleAccess>;
}

export function TechnicianOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleAccess roles={['technician']} fallback={fallback}>{children}</RoleAccess>;
}

// Module-specific components
export function UserManagement({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="users" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function PackageManagement({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="packages" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function RouterManagement({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="routers" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function ProvisioningAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="provisioning" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function PaymentManagement({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="payments" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function SMSManagement({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="sms" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function SettingsAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="settings" action="update" fallback={fallback}>{children}</ModuleAccess>;
}

export function SystemConfigAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="system_config" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function ReportsAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="reports" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}

export function BackupRestoreAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <ModuleAccess module="backup_restore" action="manage" fallback={fallback}>{children}</ModuleAccess>;
}
