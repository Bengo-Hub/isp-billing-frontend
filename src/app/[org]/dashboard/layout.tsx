import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { RBACProvider } from '@/components/rbac/RBACProvider';
import { BrandingProvider } from '@/components/theme/BrandingProvider';
import { OrgProvider } from '@/components/org/OrgProvider';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ org: string }>;
}

/**
 * Dashboard layout for ISP admins and technicians
 * Uses org slug from URL params for tenant isolation
 * Route: /[org]/dashboard/*
 */
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { org } = await params;
  return (
    <OrgProvider orgSlug={org}>
      <RBACProvider>
        <AuthGuard>
          <BrandingProvider>
            <div className="flex min-h-screen bg-background overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                  {/* Local licence gating retired — ISP subscription status is
                      owned by subscriptions-api. */}
                  <div className="min-h-full w-full">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </BrandingProvider>
        </AuthGuard>
      </RBACProvider>
    </OrgProvider>
  );
}
