'use client';

import {
    ActiveUsersChart,
    DataUsageChart,
    MostActiveUsersTable,
    NetworkUsageChart,
    PackagePerformanceTable,
    PackageUtilizationChart,
    PaymentsChart,
    RetentionChart,
    RevenueForecastChart,
    SentSMSChart
} from '@/components/dashboard/Charts';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardAnalytics } from '@/features/dashboard/api';
import { useRecentActivity } from '@/features/dashboard/hooks';
import { useTenantSmsBalance } from '@/features/sms/api';
import { Activity, MessageSquare, Users, Wallet } from 'lucide-react';

const LOG_LEVEL_COLORS: Record<string, string> = {
  success: 'bg-green-500',
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
  error: 'bg-red-500',
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function RecentActivityCard() {
  const { data: logs, isLoading } = useRecentActivity(8);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)
        ) : (!logs || logs.length === 0) ? (
          <p className="text-sm text-gray-500 py-4 text-center">No recent activity</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-1.5">
              <div className={`h-2 w-2 rounded-full ${LOG_LEVEL_COLORS[log.level] ?? 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{log.message}</p>
                <p className="text-xs text-gray-500">{timeAgo(log.timestamp || log.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  // Enable real-time updates with 30-second polling
  const { data, isLoading, error } = useDashboardAnalytics({
    refetchInterval: 60000, // Refresh every 60 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not active
  });

  // Fetch SMS balance for current user's organization
  const { data: smsBalance } = useTenantSmsBalance();

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <Card className="p-6">
          <p className="text-red-600">Error loading dashboard: {String(error)}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Amount this month" value={`Ksh ${data?.billing?.total_revenue?.toLocaleString() ?? 0}`} icon={Wallet} />
        <StatsCard title="SMS balance" value={`Ksh ${smsBalance?.current_balance?.toLocaleString() ?? 0}`} icon={MessageSquare} />
        <StatsCard title="Total clients" value={data?.subscriptions?.total_subscriptions ?? 0} icon={Users} />
        <StatsCard title="Active users" value={data?.subscriptions?.active_subscriptions ?? 0} icon={Activity} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PaymentsChart />
        <ActiveUsersChart />
        <RetentionChart />
        <DataUsageChart />
        <PackageUtilizationChart />
        <RevenueForecastChart />
        <SentSMSChart />
        <NetworkUsageChart />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard />

        <MostActiveUsersTable />
      </div>

      <div className="mt-6">
        <PackagePerformanceTable />
      </div>
    </div>
  );
}

