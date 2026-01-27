import { usePermissions } from '@/lib/store/rbac';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  module?: string;
  action?: string;
  roles?: string[];
  children?: NavigationItem[];
}

interface RBACNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function RBACNavigation({ items, className }: RBACNavigationProps) {
  const { hasPermission, hasRole, isSuperuser } = usePermissions();

  const hasAccessToItem = (item: NavigationItem): boolean => {
    // Superuser has access to everything
    if (isSuperuser()) {
      return true;
    }

    // Check module/action permissions
    if (item.module && item.action) {
      if (!hasPermission(item.module as any, item.action as any)) {
        return false;
      }
    }

    // Check role permissions
    if (item.roles && item.roles.length > 0) {
      if (!hasRole(item.roles as any)) {
        return false;
      }
    }

    // Check children access
    if (item.children && item.children.length > 0) {
      const accessibleChildren = item.children.filter(hasAccessToItem);
      return accessibleChildren.length > 0;
    }

    return true;
  };

  const filterAccessibleItems = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter(hasAccessToItem)
      .map(item => ({
        ...item,
        children: item.children ? filterAccessibleItems(item.children) : undefined,
      }));
  };

  const accessibleItems = filterAccessibleItems(items);

  return (
    <nav className={cn('space-y-1', className)}>
      {accessibleItems.map((item) => (
        <NavigationItemComponent key={item.id} item={item} />
      ))}
    </nav>
  );
}

interface NavigationItemComponentProps {
  item: NavigationItem;
}

function NavigationItemComponent({ item }: NavigationItemComponentProps) {
  const { hasPermission, hasRole, isSuperuser } = usePermissions();

  const hasAccessToItem = (item: NavigationItem): boolean => {
    if (isSuperuser()) return true;

    if (item.module && item.action) {
      if (!hasPermission(item.module as any, item.action as any)) {
        return false;
      }
    }

    if (item.roles && item.roles.length > 0) {
      if (!hasRole(item.roles as any)) {
        return false;
      }
    }

    return true;
  };

  if (!hasAccessToItem(item)) {
    return null;
  }

  return (
    <div className="space-y-1">
      <a
        href={item.href}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          'hover:bg-gray-100 hover:text-gray-900',
          'dark:hover:bg-gray-800 dark:hover:text-gray-100'
        )}
      >
        {item.icon && <span className="mr-3">{item.icon}</span>}
        {item.label}
      </a>
      
      {item.children && item.children.length > 0 && (
        <div className="ml-6 space-y-1">
          {item.children.map((child) => (
            <NavigationItemComponent key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// Predefined navigation items with RBAC configuration
export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    module: 'dashboard',
    action: 'read',
  },
  {
    id: 'users',
    label: 'Users',
    href: '/users',
    module: 'users',
    action: 'read',
    children: [
      {
        id: 'users-active',
        label: 'Active Users',
        href: '/users/active',
        module: 'users',
        action: 'read',
      },
      {
        id: 'users-all',
        label: 'All Users',
        href: '/users/all',
        module: 'users',
        action: 'read',
      },
      {
        id: 'users-create',
        label: 'Create User',
        href: '/users/create',
        module: 'users',
        action: 'create',
      },
    ],
  },
  {
    id: 'packages',
    label: 'Packages',
    href: '/packages',
    module: 'packages',
    action: 'read',
  },
  {
    id: 'routers',
    label: 'Routers',
    href: '/routers',
    module: 'routers',
    action: 'read',
    children: [
      {
        id: 'routers-list',
        label: 'Router List',
        href: '/routers',
        module: 'routers',
        action: 'read',
      },
      {
        id: 'routers-provision',
        label: 'Provisioning',
        href: '/routers/provision',
        module: 'provisioning',
        action: 'manage',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/payments',
    module: 'payments',
    action: 'read',
  },
  {
    id: 'sms',
    label: 'SMS',
    href: '/sms',
    module: 'sms',
    action: 'read',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    module: 'reports',
    action: 'read',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    module: 'settings',
    action: 'read',
    children: [
      {
        id: 'settings-general',
        label: 'General',
        href: '/settings/general',
        module: 'settings',
        action: 'update',
      },
      {
        id: 'settings-payments',
        label: 'Payments',
        href: '/settings/payments',
        module: 'settings',
        action: 'update',
      },
      {
        id: 'settings-system',
        label: 'System Config',
        href: '/settings/system',
        module: 'system_config',
        action: 'manage',
        roles: ['superuser'],
      },
    ],
  },
];

// Helper function to get navigation items based on user permissions
export function getAccessibleNavigationItems(): NavigationItem[] {
  return navigationItems;
}
