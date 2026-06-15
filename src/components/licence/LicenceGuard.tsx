'use client';

import { useLicenceStatus } from '@/features/billing/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useOrg } from '@/components/org/OrgProvider';
import { AlertTriangle, Clock, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

/**
 * LicenceGuard wraps the dashboard content and enforces licence status:
 * - Suspended: full-screen blocking overlay with renew CTA
 * - Grace period: persistent dismissable top banner with countdown
 * - Trial: subtle info banner with days remaining
 *
 * Skips enforcement for:
 * - Platform owner / superuser (they manage licences, not subscribe)
 * - Billing pages (so ISPs can still pay)
 */
export function LicenceGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { orgSlug } = useOrg();

  // Superusers / platform owners bypass licence checks
  const isSuperuser = user?.role === 'superuser';

  // Don't enforce on billing pages (both /{org}/dashboard/billing and /billing)
  const isBillingPage = pathname?.includes('/billing');

  // Only fetch licence status for non-superuser ISP users
  const { data: licence, isLoading } = useLicenceStatus({
    enabled: !isSuperuser && !!user,
  });

  // Superuser or no user yet → pass through
  if (isSuperuser || !user || isLoading) {
    return <>{children}</>;
  }

  // Bypass flag → pass through
  if (licence?.licence_bypass) {
    return <>{children}</>;
  }

  // Suspended → full block (except billing pages)
  if (licence?.is_suspended && !isBillingPage) {
    return (
      <div className="relative min-h-screen">
        {/* Blurred content behind */}
        <div className="pointer-events-none select-none blur-sm opacity-40">
          {children}
        </div>

        {/* Blocking overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Account Suspended
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Your licence has expired and the grace period has ended.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              All router management, hotspot, PPPoE, and login functionalities are paused until you renew your subscription.
            </p>
            <Link
              href={`/${orgSlug}/dashboard/billing/subscription`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors w-full"
            >
              Renew Subscription
            </Link>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
              Contact {licence?.platform?.email ?? 'support'} for assistance
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Grace period → persistent warning banner
  if (licence?.is_in_grace_period && !bannerDismissed) {
    const graceDaysLeft = licence.grace_period_ends_at
      ? Math.max(0, Math.ceil((new Date(licence.grace_period_ends_at).getTime() - Date.now()) / 86400000))
      : licence.grace_period_days;

    return (
      <>
        <div className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-red-600 px-4 py-2.5 text-white text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Grace period:</strong> Your subscription has expired.
              {graceDaysLeft > 0
                ? ` You have ${graceDaysLeft} day${graceDaysLeft !== 1 ? 's' : ''} before your account is suspended.`
                : ' Your account will be suspended shortly.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/${orgSlug}/dashboard/billing/subscription`}
              className="rounded bg-white text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              Renew Now
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              className="rounded p-0.5 hover:bg-red-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Trial → info banner with days remaining
  if (licence?.is_trial && !bannerDismissed) {
    const trialDaysLeft = licence.trial_days_remaining ?? 0;
    const isExpiringSoon = trialDaysLeft <= 3 && trialDaysLeft > 0;

    const bannerColor = isExpiringSoon
      ? 'bg-orange-500'
      : 'bg-amber-500';

    return (
      <>
        <div className={`sticky top-0 z-40 flex items-center justify-between gap-3 ${bannerColor} px-4 py-2 text-white text-sm`}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              <strong>Free trial:</strong>
              {trialDaysLeft > 0
                ? ` ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining.`
                : ' Your trial has ended.'}
              {' '}Upgrade to continue using all features.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/${orgSlug}/dashboard/billing/subscription`}
              className={`rounded bg-white ${isExpiringSoon ? 'text-orange-600' : 'text-amber-600'} px-3 py-1 text-xs font-semibold hover:bg-amber-50 transition-colors`}
            >
              Upgrade Now
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              className={`rounded p-0.5 ${isExpiringSoon ? 'hover:bg-orange-600' : 'hover:bg-amber-600'} transition-colors`}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
