import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { LicenceGuard } from '@/components/licence/LicenceGuard';
import { RBACProvider } from '@/components/rbac/RBACProvider';
import { BrandingProvider } from '@/components/theme/BrandingProvider';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RBACProvider>
      <AuthGuard>
        <BrandingProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-64">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto">
                <LicenceGuard>
                  <div className="min-h-full">
                    {children}
                  </div>
                </LicenceGuard>
              </main>
            </div>
          </div>
        </BrandingProvider>
      </AuthGuard>
    </RBACProvider>
  );
}
