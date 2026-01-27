/**
 * Re-export RBAC store from new location
 * This file exists for backward compatibility with imports from '@/lib/store/rbac'
 */
export {
  useRBACStore,
  usePermissions,
  MODULE_PERMISSIONS,
  ROLE_HIERARCHY,
  DEFAULT_ROLE_PERMISSIONS,
} from "../stores/rbac";
export type {
  UserRole,
  PermissionModule,
  PermissionAction,
  Permission,
  Role,
  SystemLicence,
} from "../stores/rbac";
