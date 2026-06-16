'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubscriptionStore, type RawSubscriptionData } from '@/lib/stores/subscription';

/**
 * useSubscription — ISP-billing port of the canonical inventory-service hook
 * (inventory-ui/src/hooks/use-subscription.ts).
 *
 * Sources subscription state from THIS service's `GET /api/v1/auth/sso-me`
 * (subscription block enriched from subscriptions-api into the SSO claims),
 * feeds the shared expiry/grace store, and exposes the same derived API the
 * inventory hook does so the shared <SubscriptionBanner> can consume it.
 */

interface SsoMeSubscription {
  status?: string | null;
  plan?: string | null;
  features?: string[];
  limits?: Record<string, number>;
  /** UNIX SECONDS timestamp of current_period_end. */
  expires?: number | null;
}

interface SsoMeData {
  subscription?: SsoMeSubscription | null;
  is_platform_owner?: boolean;
  isp_role?: string | null;
  tenant_slug?: string | null;
}

// Module-level guard so we only hit /auth/sso-me once per authenticated session
// (React Strict Mode double-invokes effects in dev; this keeps it to one fetch).
let fetchedForToken: string | null = null;

export function useSubscription() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const organizationInfo = useAuthStore((s) => s.organizationInfo);

  const subStore = useSubscriptionStore();

  // Role/exemption detection. The auth-store normalizes platform_owner → 'superuser'.
  const role = String((user as any)?.role ?? '').toLowerCase();
  const isSuperuser = role === 'superuser' || role === 'platform_owner';

  const tenantSlug =
    ((user as any)?.tenant_slug as string | undefined) ??
    organizationInfo?.organization_slug ??
    undefined;

  const isPlatformOwner =
    isSuperuser ||
    !!(user as any)?.is_platform_owner ||
    !!(user as any)?.isPlatformOwner ||
    tenantSlug === 'codevertex';

  const isDemo =
    !!(user as any)?.is_demo ||
    tenantSlug === 'codevertex-demo';

  // Single exemption flag — exempt accounts bypass ALL subscription gating and
  // never see the banner.
  const isExempt = isPlatformOwner || isDemo;

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) return;
    // Exempt accounts never need to fetch — treat them as permanently active.
    if (isExempt) {
      useSubscriptionStore.getState().setFromRaw({
        plan: 'ENTERPRISE', status: 'active', expiresAt: null, features: [], limits: {},
      });
      return;
    }

    if (fetchedForToken === accessToken) return;
    fetchedForToken = accessToken;

    (async () => {
      try {
        const resp = await apiClient.get('/auth/sso-me');
        // Unwrap the `{ data: {...} }` envelope.
        const body = resp.data as { data?: SsoMeData } | SsoMeData;
        const data = ((body as any)?.data ?? body) as SsoMeData;
        const sub = data?.subscription ?? null;

        const raw: RawSubscriptionData = {
          plan: sub?.plan ?? null,
          status: sub?.status ? String(sub.status).toLowerCase() : null,
          // `expires` is a UNIX SECONDS timestamp of current_period_end.
          expiresAt:
            typeof sub?.expires === 'number' && sub.expires > 0
              ? new Date(sub.expires * 1000)
              : null,
          features: Array.isArray(sub?.features) ? sub!.features : [],
          limits: (sub?.limits && typeof sub.limits === 'object' ? sub.limits : {}) as Record<string, number>,
        };
        useSubscriptionStore.getState().setFromRaw(raw);
      } catch {
        // On failure, mark hydrated with empty state so the banner stays silent
        // rather than blocking the dashboard.
        useSubscriptionStore.getState().setFromRaw({
          plan: null, status: null, expiresAt: null, features: [], limits: {},
        });
        // Allow a retry on the next mount if it was a transient error.
        fetchedForToken = null;
      }
    })();
  }, [isAuthenticated, accessToken, user, isExempt]);

  const subStatus = subStore.status;

  return {
    status: subStatus,
    plan: subStore.plan,
    isActive: subStatus === 'active' || subStatus === 'trial' || isExempt,
    isPastDue: subStatus === 'past_due' || subStatus === 'suspended',
    isExpired: subStore.isExpired,
    isInGracePeriod: subStore.isInGracePeriod,
    gracePeriodEndsAt: subStore.gracePeriodEndsAt,
    daysUntilExpiry: subStore.daysUntilExpiry,
    needsSubscription: (subStatus === null || subStatus === 'none') && !isExempt && subStore.hydrated,
    isLoading: !subStore.hydrated,
    isPlatformOwner,
    isDemo,
    // Exempt accounts always have every feature / unlimited limits.
    hasFeature: (code: string) => isExempt || (subStore.features?.includes(code) ?? false),
    getLimit: (key: string) => (isExempt ? Infinity : ((subStore.limits?.[key] ?? Infinity) as number)),
    store: subStore,
  };
}
