'use client';

import { Card } from '@/components/ui/card';
import { Check, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscriptionTiers, type SubscriptionTier } from '@/features/platform/api';
import { OwnershipNotice } from '@/components/platform/OwnershipNotice';
import { config } from '@/lib/config';

/**
 * Subscription Tiers — read-only summary.
 *
 * Subscription plans, tiers and entitlements are owned by subscriptions-api
 * (ISP plans are seeded there). This screen is a read-only view of the legacy
 * local pricing used by platform billing; author/edit canonical plans and
 * limits in subscriptions-api (link-out below).
 */
export default function SubscriptionTiersPage() {
  const { data: allTiers, isLoading, error } = useSubscriptionTiers();

  // Separate hotspot tiers
  const hotspotTiers = allTiers?.filter(tier => tier.tier_type === 'hotspot') || [];

  // Convert features object to array for display
  const getFeaturesArray = (tier: SubscriptionTier) => {
    const features: string[] = [];

    if (tier.max_routers > 0) {
      features.push(`Up to ${tier.max_routers} routers`);
    } else if (tier.max_routers === -1) {
      features.push('Unlimited routers');
    }

    if (tier.trial_days > 0) {
      features.push(`${tier.trial_days}-day free trial`);
    }

    if (tier.features) {
      if (tier.features.custom_domain) features.push('Custom domain');
      if (tier.features.white_label) features.push('White label');
      if (tier.features.api_access) features.push('API access');
      if (tier.features.priority_support) features.push('Priority support');
      if (tier.features.advanced_analytics) features.push('Advanced analytics');
      if (tier.features.sms_notifications) features.push('SMS notifications');
      if (tier.features.voucher_system) features.push('Voucher system');
    }

    return features;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Tiers</h1>
        <p className="text-gray-600">Read-only pricing tiers for ISP providers</p>
      </div>

      {/* Data-ownership notice: subscription plans/tiers & entitlements are owned
          by subscriptions-api (ISP_* plans). These local tiers drive legacy
          platform billing and are shown read-only; author canonical plans and
          limits in subscriptions-api. */}
      <OwnershipNotice
        owner="subscriptions-api"
        description="Subscription plans, tiers and entitlements are owned by subscriptions-api (ISP plans are already seeded there). Tiers shown here are the legacy local pricing used by platform billing and are read-only; author and edit canonical plans/limits in subscriptions-api."
        manageUrl={config.subscriptionsUiUrl || undefined}
        manageLabel="Manage plans in subscriptions"
      />

      {isLoading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-gray-600">Loading subscription tiers...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load subscription tiers</p>
              <p className="text-sm text-gray-600 mt-1">Manage plans in subscriptions-api or contact support</p>
            </div>
          </div>
        </Card>
      ) : !allTiers || allTiers.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <p className="text-gray-600">No subscription tiers found</p>
            <p className="text-sm text-gray-500">Plans are seeded and managed in subscriptions-api.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Hotspot Tiers Grid */}
          {hotspotTiers.length > 0 && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hotspot Tiers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hotspotTiers.map((tier) => (
                  <Card key={tier.id} className="p-6 relative overflow-hidden">
                    {tier.badge_text && (
                      <div
                        className="absolute top-0 right-0 text-white text-xs px-3 py-1 rounded-bl-lg"
                        style={{ backgroundColor: tier.badge_color || '#9100B0' }}
                      >
                        {tier.badge_text}
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{tier.name}</h3>
                        <p className="text-sm text-gray-500">{tier.description}</p>
                      </div>
                      <div className="p-2 bg-brand-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-brand-600" />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">KES {tier.base_monthly_fee.toLocaleString()}</span>
                        <span className="text-gray-500">/mo</span>
                      </div>
                      {tier.earnings_threshold && tier.earnings_percentage && (
                        <p className="text-sm text-gray-500">
                          + {tier.earnings_percentage}% above KES {tier.earnings_threshold.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {getFeaturesArray(tier).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* PPPoE Pricing */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">PPPoE Pricing</h2>
            <p className="text-gray-500 text-sm mb-6">PPPoE providers are charged per active user on a monthly basis.</p>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg p-8 text-center">
              <div className="mb-4">
                <div className="inline-block p-4 bg-blue-100 rounded-full">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">KES 25</div>
              <div className="text-lg text-gray-700 mb-4">per PPPoE user monthly</div>
              <div className="text-sm text-gray-600 bg-white/60 rounded-lg p-4 max-w-md mx-auto">
                <p className="font-medium mb-2">How it works:</p>
                <p>You pay 25 KES for every active PPPoE user per month. If you have 100 active users, your monthly fee is KES 2,500 (100 × 25).</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Example Calculations:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">50</div>
                  <div className="text-sm text-gray-500 mb-2">Active Users</div>
                  <div className="text-lg font-semibold text-blue-600">KES 1,250/mo</div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">200</div>
                  <div className="text-sm text-gray-500 mb-2">Active Users</div>
                  <div className="text-lg font-semibold text-blue-600">KES 5,000/mo</div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">500</div>
                  <div className="text-sm text-gray-500 mb-2">Active Users</div>
                  <div className="text-lg font-semibold text-blue-600">KES 12,500/mo</div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
