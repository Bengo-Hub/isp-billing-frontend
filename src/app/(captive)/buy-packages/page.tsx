'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgSlug = searchParams.get('org') || 'default';

  useEffect(() => {
    // Redirect to the new path-based URL
    router.replace(`/portal/${orgSlug}/buy-packages`);
  }, [orgSlug, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mb-4 mx-auto" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

export default function BuyPackagesRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mb-4 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
