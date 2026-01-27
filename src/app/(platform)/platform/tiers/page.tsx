'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, Plus } from 'lucide-react';

const defaultTiers = [
  {
    id: 1,
    name: 'Basic',
    description: 'For small ISPs just getting started',
    organization_type: 'hotspot',
    base_monthly_fee: 500,
    earnings_threshold: 10000,
    earnings_percentage: 2.0,
    max_routers: 5,
    max_customers: 100,
    features: ['Up to 5 routers', 'Up to 100 customers', 'Basic support', 'Standard reports'],
  },
  {
    id: 2,
    name: 'Professional',
    description: 'For growing ISP businesses',
    organization_type: 'hotspot',
    base_monthly_fee: 1500,
    earnings_threshold: 50000,
    earnings_percentage: 1.5,
    max_routers: 20,
    max_customers: 500,
    features: ['Up to 20 routers', 'Up to 500 customers', 'Priority support', 'Advanced reports', 'API access'],
  },
  {
    id: 3,
    name: 'Enterprise',
    description: 'For large-scale operations',
    organization_type: 'hybrid',
    base_monthly_fee: 5000,
    earnings_threshold: 200000,
    earnings_percentage: 1.0,
    max_routers: -1,
    max_customers: -1,
    features: ['Unlimited routers', 'Unlimited customers', '24/7 support', 'Custom reports', 'Dedicated account manager', 'Custom integrations'],
  },
];

export default function SubscriptionTiersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Tiers</h1>
          <p className="text-gray-600">Manage pricing tiers for ISP providers</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {defaultTiers.map((tier) => (
          <Card key={tier.id} className="p-6 relative overflow-hidden">
            {tier.name === 'Professional' && (
              <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                Popular
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-500">{tier.description}</p>
              </div>
              <div className="p-2 bg-pink-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-pink-600" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">KES {tier.base_monthly_fee.toLocaleString()}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <p className="text-sm text-gray-500">
                + {tier.earnings_percentage}% above KES {tier.earnings_threshold.toLocaleString()}
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Edit</Button>
              <Button variant="outline" className="text-gray-500">
                <span className="sr-only">More options</span>
                •••
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* PPPoE Tiers */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">PPPoE Tiers (Centipid Pricing)</h2>
        <p className="text-gray-500 text-sm">PPPoE providers follow the Centipid tiered pricing model based on active subscribers.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-500">Tier</th>
                <th className="text-right py-2 font-medium text-gray-500">Active Subscribers</th>
                <th className="text-right py-2 font-medium text-gray-500">Monthly Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Starter</td>
                <td className="text-right py-3">1 - 50</td>
                <td className="text-right py-3">KES 1,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Growth</td>
                <td className="text-right py-3">51 - 200</td>
                <td className="text-right py-3">KES 2,500</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Scale</td>
                <td className="text-right py-3">201 - 500</td>
                <td className="text-right py-3">KES 5,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Enterprise</td>
                <td className="text-right py-3">500+</td>
                <td className="text-right py-3">Custom</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
