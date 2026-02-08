"use client";
import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

interface PortalLayoutProps {
  children: ReactNode;
  orgSlug: string;
  portalType: 'hotspot' | 'pppoe';
  logoUrl?: string;
  organizationName?: string;
  primaryColor?: string;
  userName?: string;
  userType?: string;
  onSignOut?: () => void;
}

export default function PortalLayout({
  children,
  orgSlug,
  portalType,
  logoUrl,
  organizationName,
  primaryColor = '#801066',
  userName,
  userType,
  onSignOut,
}: PortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: `/portal/${portalType}/${orgSlug}`,
      show: true,
    },
    {
      label: 'Packages',
      icon: Package,
      path: `/portal/${portalType}/${orgSlug}/packages`,
      show: true,
    },
    {
      label: 'Payments',
      icon: CreditCard,
      path: `/portal/${portalType}/${orgSlug}/payments`,
      show: true,
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.show);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div
        className={cn(
          'hidden md:flex md:flex-col w-64 border-r bg-white',
          'fixed inset-y-0 left-0 z-30'
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={organizationName || 'Logo'}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Package className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg">{organizationName || 'Portal'}</h1>
              <p className="text-xs text-gray-500">Customer Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                style={
                  isActive
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        {userName && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <User className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userName}</p>
                <p className="text-xs text-gray-500">{userType || 'Customer'}</p>
              </div>
            </div>
            {onSignOut && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-white border-r z-50 transform transition-transform md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold">{organizationName || 'Portal'}</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2',
                  isActive
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                style={
                  isActive
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar - Mobile */}
        <div className="md:hidden border-b bg-white p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-bold">{organizationName || 'Portal'}</h1>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Top Bar - Desktop */}
        <div className="hidden md:block border-b bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {getGreeting()}, {userName || 'Guest'} 👋
              </h2>
              <p className="text-gray-600 mt-1">Welcome back to your portal</p>
            </div>
            {onSignOut && (
              <Button variant="outline" onClick={onSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
