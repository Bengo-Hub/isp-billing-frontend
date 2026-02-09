'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function NotFound() {
  const user = useAuthStore((state) => state.user);
  const organizationInfo = useAuthStore((state) => state.organizationInfo);
  const customerPortalInfo = useAuthStore((state) => state.customerPortalInfo);

  // Determine dashboard URL based on user role and org
  const getDashboardUrl = () => {
    if (!user) return '/login';

    if (user.role === 'superuser') {
      return '/platform';
    }

    // Customers should NEVER go to ISP dashboard - redirect to their portal
    if (user.role === 'customer' && customerPortalInfo?.portal_url) {
      return customerPortalInfo.portal_url;
    }

    // ISP users (admin, technician) go to their org dashboard
    const orgSlug = organizationInfo?.organization_slug;
    if (orgSlug) {
      return `/${orgSlug}/dashboard`;
    }

    return '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="text-7xl font-extrabold text-gray-200">404</div>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">The page you are looking for does not exist or has moved.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Go to Home</Button>
          </Link>
          <Link href={getDashboardUrl()}>
            <Button className="bg-brand-600 hover:bg-brand-700">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
