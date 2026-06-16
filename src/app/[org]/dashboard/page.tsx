'use client';

import {
    ActiveUsersChart,
    DataUsageChart,
    MostActiveUsersTable,
    NetworkUsageChart,
    PackagePerformanceTable,
    PackageUtilizationChart,
    PaymentsChart,
    RegistrationsChart,
    RetentionChart,
    RevenueForecastChart,
    SentSMSChart
} from '@/components/dashboard/Charts';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RouterFilter } from '@/components/filters/RouterFilter';
import { useDashboardAnalytics, useDashboardCharts } from '@/features/dashboard/api';
import { useRecentActivity } from '@/features/dashboard/hooks';
import { Activity, Users, Wallet } from 'lucide-react';
import { useState } from 'react';

const LOG_LEVEL_COLORS: Record<string, string> = {
  success: 'bg-success',
  info: 'bg-primary',
  warning: 'bg-warning',
  error: 'bg-destructive',
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
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)
        ) : (!logs || logs.length === 0) ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-1.5">
              <div className={`h-2 w-2 rounded-full ${LOG_LEVEL_COLORS[log.level] ?? 'bg-muted'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{log.message}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(log.timestamp || log.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [selectedRouterId, setSelectedRouterId] = useState<number | null>(null);

  // Fetch summary stats with 60-second polling
  const { data, isLoading, error } = useDashboardAnalytics(
    { router_id: selectedRouterId },
    {
      refetchInterval: 60000,
      refetchIntervalInBackground: true,
    }
  );

  // Fetch chart data with 60-second polling
  const { data: charts } = useDashboardCharts(
    { router_id: selectedRouterId },
    {
      refetchInterval: 60000,
      refetchIntervalInBackground: true,
    }
  );

  // SMS balance / messaging credits are managed centrally in notifications-ui;
  // the dashboard no longer surfaces an SMS-balance widget here.

  if (isLoading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 sm:h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">Dashboard</h1>
        <Card className="p-4 sm:p-6">
          <p className="text-destructive text-sm sm:text-base">Error loading dashboard: {String(error)}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <RouterFilter value={selectedRouterId} onChange={setSelectedRouterId} />
      </div>

      {/* Subscription status is shown by the shared <SubscriptionBanner /> mounted
          in the dashboard layout (exempts demo + platform owner). */}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatsCard title="Amount this month" value={`Ksh ${data?.billing?.total_revenue?.toLocaleString() ?? 0}`} icon={Wallet} />
        <StatsCard title="Total clients" value={data?.subscriptions?.total_subscriptions ?? 0} icon={Users} />
        <StatsCard title="Active users" value={data?.subscriptions?.active_subscriptions ?? 0} icon={Activity} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <PaymentsChart data={charts?.payments_chart} />
        <ActiveUsersChart data={charts?.active_users_chart} />
        <RetentionChart data={charts?.retention_chart} />
        <DataUsageChart data={charts?.data_usage_chart} />
        <PackageUtilizationChart data={charts?.package_utilization_chart} />
        <RevenueForecastChart data={charts?.revenue_forecast_chart} />
        <SentSMSChart data={charts?.sms_sent_chart} />
        <NetworkUsageChart data={charts?.network_usage_chart} />
      </div>

      {/* Registrations + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <RegistrationsChart data={charts?.registrations_chart} />
        <RecentActivityCard />
      </div>

      {/* Most Active Users */}
      <div className="mb-4 sm:mb-6">
        <MostActiveUsersTable data={charts?.most_active_users} />
      </div>

      {/* Package Performance */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <PackagePerformanceTable data={charts?.package_performance} />
        </div>
      </div>
    </div>
  );
}
