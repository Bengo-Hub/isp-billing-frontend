'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/lib/auth';
import { useOrg } from '@/components/org/OrgProvider';
import { Bell, ChevronDown, Filter, KeyRound, LogOut, Search, Settings, ShieldCheck, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { orgSlug } = useOrg();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 border-b border-border bg-card flex items-center justify-between px-2 sm:px-4 lg:px-6 w-full lg:pl-6">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pl-12 lg:pl-0">
        {/* Desktop search bar */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, packages, payments..."
            className="pl-10 bg-muted border-border text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
        <ThemeToggle />
        <Button variant="outline" size="sm" className="gap-1 hidden lg:flex h-9 px-3">
          <Filter className="h-4 w-4" /> Filters
        </Button>
        <Button variant="ghost" size="sm" className="relative p-2 h-9 w-9">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-9 px-2 sm:px-3">
              <span className="hidden md:inline text-sm">Admin</span>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/security/2fa`}>
                <ShieldCheck className="h-4 w-4" /> 2FA Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/settings`}>
                <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/billing/subscription`}>
                <KeyRound className="h-4 w-4" /> Billing & Subscription
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/users/system`}>
                <Users className="h-4 w-4" /> System users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/logs/system`}>
                <UserCog className="h-4 w-4" /> System logs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Features & Bug Report
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <Link href={`/${orgSlug}/dashboard/support/feature-request`}>Report a bug</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${orgSlug}/dashboard/support/feature-request`}>Request a feature</Link>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>Refer a friend</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/shop/equipment`}>Shop Equipment</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/dashboard/support/contact`}>Contact Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sign out
              <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

