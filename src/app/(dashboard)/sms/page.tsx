'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import SMSBalanceCard from '@/components/sms/SMSBalanceCard';
import TopUpDialog from '@/components/sms/TopUpDialog';
import { Card } from '@/components/ui/card';
import { useSmsAnalytics, useTenantSmsBalance } from '@/features/sms/api';
import { CheckCircle, MessageSquare, Send } from 'lucide-react';

const DEFAULT_ACCOUNT_ID = 1;

export default function SMSPage() {
  const { data: smsBalance } = useTenantSmsBalance();
  const { data: analytics } = useSmsAnalytics(DEFAULT_ACCOUNT_ID);

  const credits = smsBalance?.current_balance?.toLocaleString() ?? '0';
  const sentThisMonth = analytics?.total_sent?.toLocaleString() ?? '0';
  const deliveryRate = analytics?.delivery_rate != null
    ? `${(analytics.delivery_rate * 100).toFixed(1)}%`
    : '—';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Management</h1>
          <p className="text-gray-600 mt-1">Manage SMS notifications and credits</p>
        </div>
        <TopUpDialog accountId={DEFAULT_ACCOUNT_ID} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Available Credits"
          value={credits}
          icon={MessageSquare}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Sent This Month"
          value={sentThisMonth}
          icon={Send}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Delivery Rate"
          value={deliveryRate}
          icon={CheckCircle}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <Card className="p-6">
        <SMSBalanceCard accountId={DEFAULT_ACCOUNT_ID} />
      </Card>
    </div>
  );
}

