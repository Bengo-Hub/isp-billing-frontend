import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { RBACProvider } from '@/components/rbac/RBACProvider';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RBACProvider>
      <AuthGuard>
        <div className="flex min-h-screen bg-creamy-white">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto">
              <div className="min-h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    </RBACProvider>
  );
}
