import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { RBACProvider } from '@/components/rbac/RBACProvider';
import { OrgProvider } from '@/components/org/OrgProvider';
import { ReactNode } from 'react';

interface PortalLayoutProps {
  children: ReactNode;
  params: Promise<{ org: string }>;
}

/**
 * Portal layout for customer portal pages (hotspot and PPPoE)
 * Uses org slug from URL params for tenant isolation
 * Route: /[org]/portal/hotspot/* and /[org]/portal/pppoe/*
 */
export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { org } = await params;
  // Portal pages use the dashboard layout with RBAC
  // Customers see only portal-specific pages (Packages, Payments)
  return (
    <OrgProvider orgSlug={org}>
      <RBACProvider>
        <AuthGuard>
          <div className="flex min-h-screen bg-creamy-white overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="min-h-full w-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AuthGuard>
      </RBACProvider>
    </OrgProvider>
  );
}
