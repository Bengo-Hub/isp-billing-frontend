'use client';

import { useSettings } from '@/features/settings/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRBACStore, type PermissionModule } from '@/lib/stores/rbac';
import {
    BarChart3,
    Building2,
    Calendar,
    CreditCard,
    Globe,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    MessageSquare,
    Package,
    Settings,
    Shield,
    Ticket,
    User,
    Users,
    Wifi,
    X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  module?: PermissionModule;
  roles?: ('superuser' | 'admin' | 'technician' | 'customer')[];
}

interface NavSection {
  section: string;
  items: NavItem[];
  roles?: ('superuser' | 'admin' | 'technician' | 'customer')[];
}

type NavigationItem = NavItem | NavSection;

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },

  // Users Section - ISP Admin, Technicians
  {
    section: 'Customers',
    roles: ['superuser', 'admin', 'technician'],
    items: [
      { name: 'Active Connections', href: '/users', icon: Wifi, module: 'users' },
      { name: 'Customers', href: '/users/all', icon: Users, module: 'users' },
      { name: 'Expiry Dates', href: '/users/expiry', icon: Calendar, module: 'users' },
      { name: 'IP Bindings', href: '/ip-bindings', icon: Wifi, module: 'users' },
      { name: 'Tickets', href: '/tickets', icon: Ticket, module: 'users' },
      { name: 'Leads', href: '/leads', icon: Users, module: 'users' },
    ]
  },

  // Finance Section - ISP Admin, Technicians (limited)
  {
    section: 'Finance',
    roles: ['superuser', 'admin', 'technician'],
    items: [
      { name: 'Packages', href: '/packages', icon: Package, module: 'packages' },
      { name: 'Payments', href: '/payments', icon: CreditCard, module: 'payments' },
      { name: 'Vouchers', href: '/vouchers', icon: CreditCard, module: 'packages' },
      { name: 'Expenses', href: '/expenses', icon: CreditCard, module: 'payments', roles: ['superuser', 'admin'] },
    ]
  },

  // Communication Section - ISP Admin, Technicians
  {
    section: 'Communication',
    roles: ['superuser', 'admin', 'technician'],
    items: [
      { name: 'Messages', href: '/messages', icon: MessageSquare, module: 'sms' },
      { name: 'Emails', href: '/emails', icon: Mail, module: 'sms' },
      { name: 'Campaigns', href: '/campaigns', icon: MessageSquare, module: 'sms', roles: ['superuser', 'admin'] },
    ]
  },

  // Devices - ISP Admin, Technicians
  {
    section: 'Devices',
    roles: ['superuser', 'admin', 'technician'],
    items: [
      { name: 'MikroTik', href: '/routers', icon: Wifi, module: 'routers' },
    ]
  },

  // Reports & Admin - ISP Admin
  { name: 'Reports', href: '/reports', icon: BarChart3, module: 'reports', roles: ['superuser', 'admin'] },
  {
    section: 'Administration',
    roles: ['superuser', 'admin'],
    items: [
      { name: 'System Users', href: '/users/system', icon: Shield, module: 'users', roles: ['superuser', 'admin'] },
      { name: 'Settings', href: '/settings', icon: Settings, module: 'settings', roles: ['superuser', 'admin'] },
    ]
  },

  // Platform Administration - Superuser only
  {
    section: 'Platform',
    roles: ['superuser'],
    items: [
      { name: 'Platform Admin', href: '/platform', icon: Building2, roles: ['superuser'] },
      { name: 'ISP Providers', href: '/platform/organizations', icon: Shield, roles: ['superuser'] },
      { name: 'Platform Users', href: '/platform/users', icon: Users, roles: ['superuser'] },
      { name: 'Platform Settings', href: '/platform/settings', icon: Settings, roles: ['superuser'] },
    ]
  },
];

/**
 * Customer-specific navigation items.
 * Built dynamically because portal routes include the org slug.
 */
function getCustomerNavigation(orgSlug: string, subscriptionType: string): NavigationItem[] {
  const portalBase = `/portal/${subscriptionType}/${orgSlug}`;
  return [
    { name: 'My Dashboard', href: portalBase, icon: LayoutDashboard, module: 'customer_dashboard' as PermissionModule, roles: ['customer'] as const },
    {
      section: 'My Account',
      roles: ['customer'] as const,
      items: [
        { name: 'Packages', href: `${portalBase}#packages`, icon: Package, module: 'customer_packages' as PermissionModule, roles: ['customer'] as const },
        { name: 'Payments', href: `${portalBase}#payments`, icon: CreditCard, module: 'customer_payments' as PermissionModule, roles: ['customer'] as const },
        { name: 'Usage', href: `${portalBase}#usage`, icon: Globe, module: 'customer_usage' as PermissionModule, roles: ['customer'] as const },
        { name: 'Profile', href: '/settings', icon: User, module: 'customer_profile' as PermissionModule, roles: ['customer'] as const },
      ]
    },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userRole, canAccessModule } = useRBACStore();
  const { user, logout, customerPortalInfo } = useAuthStore();

  // Build full navigation: admin nav + customer nav (if applicable)
  const fullNavigation = useMemo(() => {
    if (userRole === 'customer' && customerPortalInfo) {
      return [
        ...navigation,
        ...getCustomerNavigation(customerPortalInfo.organization_slug, customerPortalInfo.subscription_type),
      ];
    }
    return navigation;
  }, [userRole, customerPortalInfo]);

  // Filter navigation based on user role and permissions
  const filteredNavigation = useMemo(() => {
    if (!userRole) return [];

    return fullNavigation.filter((item) => {
      // Handle section items
      if ('section' in item) {
        // Check if section is allowed for this role
        if (item.roles && !item.roles.includes(userRole)) {
          return false;
        }
        // Filter section items based on permissions
        const filteredItems = item.items.filter((subItem) => {
          // Check role restriction on item
          if (subItem.roles && !subItem.roles.includes(userRole)) {
            return false;
          }
          // Check module permission
          if (subItem.module && !canAccessModule(subItem.module)) {
            return false;
          }
          return true;
        });
        // Only include section if it has visible items
        return filteredItems.length > 0;
      }

      // Handle regular navigation items
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      if (item.module && !canAccessModule(item.module)) {
        return false;
      }
      return true;
    }).map((item) => {
      // Filter section items for sections that passed
      if ('section' in item) {
        return {
          ...item,
          items: item.items.filter((subItem) => {
            if (subItem.roles && !subItem.roles.includes(userRole)) {
              return false;
            }
            if (subItem.module && !canAccessModule(subItem.module)) {
              return false;
            }
            return true;
          }),
        };
      }
      return item;
    });
  }, [userRole, canAccessModule]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isMobileMenuOpen ? (
          <X className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col border-r border-sidebar-border ${
        isMobileMenuOpen ? 'fixed inset-y-0 z-50' : 'hidden lg:flex lg:fixed lg:inset-y-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <LogoArea />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {filteredNavigation.map((item, index) => {
            // Handle section items
            if ('section' in item) {
              return (
                <div key={item.section} className="space-y-1">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.section}
                  </div>
                  {item.items?.map((subItem) => {
                    const isActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/');
                    const Icon = subItem.icon;
                    
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-sidebar-active text-sidebar-active-foreground border-r-2 border-sidebar-active-border'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {subItem.name}
                        {subItem.count !== undefined && (
                          <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                            {subItem.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            }
            
            // Handle regular navigation items
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-active text-sidebar-active-foreground border-r-2 border-sidebar-active-border'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                {user?.last_name?.[0] || ''}
              </span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || 'User'}
              </div>
              <div className="text-xs text-muted-foreground capitalize">{userRole || 'User'}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function LogoArea() {
  const { data = {} as any } = useSettings('system');
  const [imageError, setImageError] = useState(false);
  const customLogoUrl = ((data['system.logo_url'] as string) || '').replace(/^"|"$/g, '');

  // Validate URL - must be absolute URL or relative path starting with /
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim().length === 0) return false;
    // Check if it's an absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
    // Check if it's a valid relative path
    return url.startsWith('/');
  };

  const hasCustomLogo = isValidUrl(customLogoUrl) && !imageError;
  const logoSrc = hasCustomLogo ? customLogoUrl : '/images/logo/logo.png';

  // If the image fails to load, show the text fallback only
  const showTextFallback = imageError;

  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      {!showTextFallback ? (
        <div className="relative w-full h-14">
          <Image
            src={logoSrc}
            alt="Company Logo"
            fill
            sizes="(min-width: 1024px) 16rem, 100vw"
            className="object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div>
          <div className="font-bold text-foreground">CodeVertex ISP Billing</div>
          <div className="text-xs text-muted-foreground">Admin Portal</div>
        </div>
      )}
    </Link>
  );
}

