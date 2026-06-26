'use client';

import { OwnershipNotice } from '@/components/platform/OwnershipNotice';
import { config } from '@/lib/config';

/**
 * Subscription Tiers — retired.
 *
 * Subscription plans, tiers and entitlements are OWNED by subscriptions-api
 * (ISP plans are seeded there). The platform `/platform/tiers` admin endpoint
 * was removed, so this screen no longer fetches or renders local tiers — it
 * only shows the data-ownership notice and links out to subscriptions-api for
 * authoring canonical plans and limits.
 */
export default function SubscriptionTiersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Tiers</h1>
        <p className="text-gray-600">Managed in subscriptions-api</p>
      </div>

      <OwnershipNotice
        owner="subscriptions-api"
        description="Subscription plans, tiers and entitlements are owned by subscriptions-api (ISP plans are already seeded there). Tier management was removed from the platform UI — author and edit canonical plans, tiers and limits in subscriptions-api."
        manageUrl={config.subscriptionsUiUrl || undefined}
        manageLabel="Manage plans in subscriptions"
      />
    </div>
  );
}
