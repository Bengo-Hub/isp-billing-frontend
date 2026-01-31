import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

// SSR-safe storage that only uses localStorage in the browser
const getStorage = (): StateStorage => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

export type UserRole = 'superuser' | 'admin' | 'technician' | 'customer';

export type PermissionModule =
  // Core ISP modules
  | 'dashboard'
  | 'users'
  | 'customers'
  | 'packages'
  | 'routers'
  | 'provisioning'
  | 'payments'
  | 'payment_gateways'
  | 'sms'
  | 'vouchers'
  | 'settings'
  | 'reports'
  | 'notifications'
  | 'support'
  | 'billing'
  | 'subscriptions'
  | 'analytics'
  | 'branding'
  | 'audit_logs'
  | 'backup_restore'
  // Legacy modules (backward compatibility)
  | 'system_config'
  | 'licence_management'
  // Platform owner modules (ISP Software Provider only)
  | 'platform_organizations'
  | 'platform_billing'
  | 'platform_analytics'
  | 'platform_config'
  | 'platform_tiers'
  | 'platform_integrations'
  | 'platform_integrations_secrets'
  | 'platform_integrations_urls'
  | 'platform_payment_gateways'
  | 'platform_sms_gateways'
  | 'platform_email_gateways'
  // Tenant integration modules (ISP Admin)
  | 'tenant_payment_config'
  | 'tenant_sms_config'
  | 'tenant_payout_config'
  // Customer portal modules
  | 'customer_dashboard'
  | 'customer_packages'
  | 'customer_payments'
  | 'customer_usage'
  | 'customer_profile';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface Permission {
  id: number;
  module: PermissionModule;
  action: PermissionAction;
  resource?: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system_role: boolean;
  permissions: Permission[];
}

export interface SystemLicence {
  id: number;
  licence_key: string;
  organization_name: string;
  contact_email: string;
  contact_phone?: string;
  licence_type: 'trial' | 'subscription' | 'perpetual';
  is_active: boolean;
  max_users: number;
  max_routers: number;
  trial_days: number;
  trial_started_at?: string;
  trial_expires_at?: string;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  auto_renew: boolean;
  is_trial_active: boolean;
  days_remaining: number;
}

interface RBACState {
  // User role and permissions
  userRole: UserRole | null;
  userPermissions: Permission[];
  licence: SystemLicence | null;
  
  // Actions
  setUserRole: (role: UserRole | null) => void;
  setUserPermissions: (permissions: Permission[]) => void;
  setLicence: (licence: SystemLicence | null) => void;
  
  // Permission checking
  hasPermission: (module: PermissionModule, action: PermissionAction, resource?: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isSuperuser: () => boolean;
  isAdmin: () => boolean;
  isTechnician: () => boolean;
  isCustomer: () => boolean;
  
  // UI helpers
  canAccessModule: (module: PermissionModule) => boolean;
  canPerformAction: (module: PermissionModule, action: PermissionAction) => boolean;
  
  // Reset
  resetRBAC: () => void;
}

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      userRole: null,
      userPermissions: [],
      licence: null,

      setUserRole: (role) => set({ userRole: role }),
      
      setUserPermissions: (permissions) => set({ userPermissions: permissions }),
      
      setLicence: (licence: SystemLicence | null) => set({ licence }),

      hasPermission: (module, action, resource) => {
        const { userPermissions } = get();
        
        // Superuser has all permissions
        if (get().isSuperuser()) {
          return true;
        }
        
        return userPermissions.some(permission => 
          permission.module === module && 
          permission.action === action && 
          permission.resource === (resource || undefined)
        );
      },

      hasRole: (roles) => {
        const { userRole } = get();
        return userRole ? roles.includes(userRole) : false;
      },

      isSuperuser: () => {
        return get().userRole === 'superuser';
      },

      isAdmin: () => {
        const { userRole } = get();
        return userRole === 'admin' || userRole === 'superuser';
      },

      isTechnician: () => {
        return get().userRole === 'technician';
      },

      isCustomer: () => {
        return get().userRole === 'customer';
      },

      canAccessModule: (module) => {
        const { hasPermission } = get();
        
        // Check for read permission on the module
        return hasPermission(module, 'read') || 
               hasPermission(module, 'manage') ||
               get().isSuperuser();
      },

      canPerformAction: (module, action) => {
        return get().hasPermission(module, action) || 
               get().hasPermission(module, 'manage') ||
               get().isSuperuser();
      },

      resetRBAC: () => set({
        userRole: null,
        userPermissions: [],
        licence: null,
      }),
    }),
    {
      name: 'rbac-storage',
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        userRole: state.userRole,
        userPermissions: state.userPermissions,
        licence: state.licence,
      }),
      skipHydration: true,
    }
  )
);

// Helper hooks for common permission checks
export const usePermissions = () => {
  const store = useRBACStore();

  return {
    // Role checks
    isSuperuser: store.isSuperuser,
    isAdmin: store.isAdmin,
    isTechnician: store.isTechnician,
    isCustomer: store.isCustomer,
    hasRole: store.hasRole,

    // Permission checks
    hasPermission: store.hasPermission,
    canAccessModule: store.canAccessModule,
    canPerformAction: store.canPerformAction,
    
    // Module-specific checks
    canManageUsers: () => store.hasPermission('users', 'manage'),
    canManagePackages: () => store.hasPermission('packages', 'manage'),
    canManageRouters: () => store.hasPermission('routers', 'manage'),
    canManageProvisioning: () => store.hasPermission('provisioning', 'manage'),
    canManagePayments: () => store.hasPermission('payments', 'manage'),
    canManageSMS: () => store.hasPermission('sms', 'manage'),
    canManageSettings: () => store.hasPermission('settings', 'update'),
    canManageSystemConfig: () => store.hasPermission('system_config', 'manage'),
    canManageReports: () => store.hasPermission('reports', 'manage'),
    canManageBackupRestore: () => store.hasPermission('backup_restore', 'manage'),
    
    // Platform integration checks (ISP Software Provider only)
    canAccessPlatformIntegrations: () => 
      store.hasPermission('platform_integrations', 'read') || 
      store.hasPermission('platform_integrations', 'manage') ||
      store.isSuperuser(),
    canManagePlatformSecrets: () => 
      store.hasPermission('platform_integrations_secrets', 'update') ||
      store.hasPermission('platform_integrations_secrets', 'manage') ||
      store.isSuperuser(),
    canViewIntegrationUrls: () => 
      store.hasPermission('platform_integrations_urls', 'read') ||
      store.isSuperuser(),
    canManagePaymentGateways: () => 
      store.hasPermission('platform_payment_gateways', 'manage') ||
      store.isSuperuser(),
    canManageSMSGateways: () => 
      store.hasPermission('platform_sms_gateways', 'manage') ||
      store.isSuperuser(),
    
    // Tenant integration checks (ISP Admin)
    canConfigureTenantPayment: () => 
      store.hasPermission('tenant_payment_config', 'update') ||
      store.isAdmin(),
    canConfigureTenantSMS: () => 
      store.hasPermission('tenant_sms_config', 'update') ||
      store.isAdmin(),
    canConfigureTenantPayout: () => 
      store.hasPermission('tenant_payout_config', 'update') ||
      store.hasPermission('tenant_payout_config', 'create') ||
      store.isAdmin(),
    
    // Trial/licence checks
    isTrialActive: () => store.licence?.is_trial_active || false,
    trialDaysRemaining: () => store.licence?.days_remaining || 0,
    
    // User permissions
    userRole: store.userRole,
    userPermissions: store.userPermissions,
    licence: store.licence,
  };
};

// Module access configuration
export const MODULE_PERMISSIONS: Record<PermissionModule, PermissionAction[]> = {
  // Core ISP modules
  dashboard: ['read'],
  users: ['create', 'read', 'update', 'delete', 'manage'],
  customers: ['create', 'read', 'update', 'delete', 'manage'],
  packages: ['create', 'read', 'update', 'delete', 'manage'],
  routers: ['create', 'read', 'update', 'delete', 'manage'],
  provisioning: ['manage'],
  payments: ['read', 'manage'],
  payment_gateways: ['create', 'read', 'update', 'delete', 'manage'],
  sms: ['read', 'manage'],
  vouchers: ['create', 'read', 'update', 'delete', 'manage'],
  settings: ['read', 'update'],
  reports: ['read', 'manage'],
  notifications: ['read', 'manage'],
  support: ['create', 'read', 'update', 'delete', 'manage'],
  billing: ['read', 'manage'],
  subscriptions: ['create', 'read', 'update', 'delete', 'manage'],
  analytics: ['read'],
  branding: ['read', 'update'],
  audit_logs: ['read', 'manage'],
  backup_restore: ['manage'],
  // Legacy modules
  system_config: ['manage'],
  licence_management: ['manage'],
  // Platform owner modules
  platform_organizations: ['create', 'read', 'update', 'delete', 'manage'],
  platform_billing: ['read', 'manage'],
  platform_analytics: ['read'],
  platform_config: ['manage'],
  platform_tiers: ['manage'],
  platform_integrations: ['create', 'read', 'update', 'delete', 'manage'],
  platform_integrations_secrets: ['read', 'update', 'manage'],
  platform_integrations_urls: ['read', 'update', 'manage'],
  platform_payment_gateways: ['create', 'read', 'update', 'delete', 'manage'],
  platform_sms_gateways: ['create', 'read', 'update', 'delete', 'manage'],
  platform_email_gateways: ['create', 'read', 'update', 'delete', 'manage'],
  // Tenant integration modules
  tenant_payment_config: ['read', 'update'],
  tenant_sms_config: ['read', 'update'],
  tenant_payout_config: ['create', 'read', 'update'],
  // Customer portal modules
  customer_dashboard: ['read'],
  customer_packages: ['read'],
  customer_payments: ['read'],
  customer_usage: ['read'],
  customer_profile: ['read', 'update'],
};

// Role hierarchy for UI display
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superuser: 4,
  admin: 3,
  technician: 2,
  customer: 1,
};

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionModule[]> = {
  superuser: [
    // Core ISP modules
    'dashboard', 'users', 'customers', 'packages', 'routers', 'provisioning',
    'payments', 'payment_gateways', 'sms', 'vouchers', 'settings', 'reports',
    'notifications', 'support', 'billing', 'subscriptions', 'analytics',
    'branding', 'audit_logs', 'backup_restore',
    // Legacy modules
    'system_config', 'licence_management',
    // Platform owner modules (superuser only)
    'platform_organizations', 'platform_billing', 'platform_analytics',
    'platform_config', 'platform_tiers', 'platform_integrations',
    'platform_integrations_secrets', 'platform_integrations_urls',
    'platform_payment_gateways', 'platform_sms_gateways', 'platform_email_gateways',
    // Tenant integration modules
    'tenant_payment_config', 'tenant_sms_config', 'tenant_payout_config',
  ],
  admin: [
    // Core ISP modules
    'dashboard', 'users', 'customers', 'packages', 'routers', 'provisioning',
    'payments', 'payment_gateways', 'sms', 'vouchers', 'settings', 'reports',
    'notifications', 'support', 'billing', 'subscriptions', 'analytics',
    'branding', 'audit_logs',
    // Tenant integration modules (ISP admin configures these)
    'tenant_payment_config', 'tenant_sms_config', 'tenant_payout_config',
  ],
  technician: [
    // Operational modules for technicians
    'dashboard', 'users', 'customers', 'packages', 'routers', 'provisioning',
    'payments', 'sms', 'vouchers', 'notifications', 'support', 'subscriptions',
  ],
  customer: [
    // Customer portal modules only
    'customer_dashboard', 'customer_packages', 'customer_payments',
    'customer_usage', 'customer_profile', 'notifications',
  ],
};
