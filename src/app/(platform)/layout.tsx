'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RBACProvider } from '@/components/rbac/RBACProvider';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

const platformNavItems = [
  { href: '/platform', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/platform/organizations', label: 'Organizations', icon: Building2 },
  { href: '/platform/billing', label: 'Billing', icon: Receipt },
  { href: '/platform/tiers', label: 'Subscription Tiers', icon: CreditCard },
  { href: '/platform/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/platform/settings', label: 'Settings', icon: Settings },
];

function PlatformSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <Link href="/platform" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">ISP Platform</span>
            </Link>
            <button onClick={onClose} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {platformNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/platform' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-pink-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => logout()}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

function PlatformHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div className="hidden sm:block">
          <span className="text-sm text-gray-500">Platform Administration</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-pink-600" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{user?.name || 'Platform Admin'}</div>
            <div className="text-xs text-gray-500">Platform Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RBACProvider>
      <AuthGuard requiredRole="platform_owner">
        <div className="flex min-h-screen bg-gray-50">
          <PlatformSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col lg:ml-64">
            <PlatformHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </RBACProvider>
  );
}
