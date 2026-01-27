'use client';

import { useSettings } from '@/features/settings/api';
import {
    BarChart3,
    Calendar,
    ChevronDown,
    CreditCard,
    LayoutDashboard,
    Mail,
    Menu,
    MessageSquare,
    Package,
    Settings,
    Ticket,
    Users,
    Wifi,
    X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  
  // Users Section
  {
    section: 'Users',
    items: [
      { name: 'Active Users', href: '/users', icon: BarChart3, count: 5 },
      { name: 'Users', href: '/users/all', icon: Users, count: 179 },
      { name: 'Expiry Dates', href: '/users/expiry', icon: Calendar, count: 4 },
      { name: 'IP Bindings', href: '/ip-bindings', icon: Wifi, count: 0 },
      { name: 'Tickets', href: '/tickets', icon: Ticket, count: 0 },
      { name: 'Leads', href: '/leads', icon: Users, count: 0 },
    ]
  },
  
  // Finance Section
  {
    section: 'Finance',
    items: [
      { name: 'Packages', href: '/packages', icon: Package, count: 10 },
      { name: 'Payments', href: '/payments', icon: CreditCard },
      { name: 'Vouchers', href: '/vouchers', icon: CreditCard, count: 0 },
      { name: 'Expenses', href: '/expenses', icon: CreditCard },
    ]
  },
  
  // Communication Section
  {
    section: 'Communication',
    items: [
      { name: 'Messages', href: '/messages', icon: MessageSquare },
      { name: 'Emails', href: '/emails', icon: Mail },
      { name: 'Campaigns', href: '/campaigns', icon: MessageSquare, count: 0 },
    ]
  },
  
  // Devices
  {
    section: 'Devices',
    items: [
      { name: 'MikroTik', href: '/routers', icon: Wifi },
    ]
  },
  
  // Other
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
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
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-creamy-white text-gray-900 min-h-screen flex flex-col border-r border-gray-200 ${
        isMobileMenuOpen ? 'fixed inset-y-0 z-50' : 'hidden lg:flex lg:fixed lg:inset-y-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <LogoArea />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navigation.map((item, index) => {
            // Handle section items
            if ('section' in item) {
              return (
                <div key={item.section} className="space-y-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                            ? 'bg-pink-100 text-pink-900 border-r-2 border-pink-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {subItem.name}
                        {subItem.count !== undefined && (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
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
                    ? 'bg-pink-100 text-pink-900 border-r-2 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">John Doe</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </aside>
    </>
  );
}

function LogoArea() {
  const { data = {} as any } = useSettings('system');
  const [imageError, setImageError] = useState(false);
  const customLogoUrl = (data['system.logo_url'] as string) || '';
  const hasCustomLogo = !!customLogoUrl && customLogoUrl.trim().length > 0;
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
          <div className="font-bold text-gray-900">CodeVertex ISP Billing</div>
          <div className="text-xs text-gray-500">Admin Portal</div>
        </div>
      )}
    </Link>
  );
}

