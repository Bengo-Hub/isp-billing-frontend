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
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RouterFilter } from '@/components/filters/RouterFilter';
import type { BillingCycle } from '@/features/dashboard/api';
import { useDashboardAnalytics, useDashboardCharts } from '@/features/dashboard/api';
import { useRecentActivity } from '@/features/dashboard/hooks';
import { useTenantSmsBalance } from '@/features/sms/api';
import { useOrg } from '@/components/org/OrgProvider';
import { Activity, ArrowRight, CalendarClock, MessageSquare, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
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

function BillingCycleBanner({ cycle }: { cycle: BillingCycle | null | undefined }) {
  const { orgSlug } = useOrg();

  if (!cycle) return null;

  const expiryDate = cycle.is_trial ? cycle.trial_ends_at : cycle.subscription_ends_at;
  const daysLeft = cycle.is_trial ? cycle.trial_days_remaining : cycle.subscription_days_remaining;
  const formatted = expiryDate
    ? new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
  const isExpired = !cycle.is_subscription_active;

  let bgColor = 'bg-primary/10 border-primary/20';
  let textColor = 'text-primary';
  let badgeClass = 'bg-primary/10 text-primary border-primary/20';
  let btnClass = 'bg-primary hover:bg-primary/90 text-primary-foreground';
  let label = 'Active';

  if (cycle.is_trial) {
    bgColor = 'bg-warning/10 border-warning/20';
    textColor = 'text-warning';
    badgeClass = 'bg-warning/10 text-warning border-warning/20';
    btnClass = 'bg-warning hover:bg-warning/90 text-warning-foreground';
    label = 'Trial';
  } else if (isExpired) {
    bgColor = 'bg-destructive/10 border-destructive/20';
    textColor = 'text-destructive';
    badgeClass = 'bg-destructive/10 text-destructive border-destructive/20';
    btnClass = 'bg-destructive hover:bg-destructive/90 text-destructive-foreground';
    label = 'Expired';
  } else if (isExpiringSoon) {
    bgColor = 'bg-warning/10 border-warning/20';
    textColor = 'text-warning';
    badgeClass = 'bg-warning/10 text-warning border-warning/20';
    btnClass = 'bg-warning hover:bg-warning/90 text-warning-foreground';
    label = 'Expiring Soon';
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border ${bgColor} mb-4 sm:mb-6`}>
      <div className="flex items-center gap-2">
        <CalendarClock className={`h-4 w-4 sm:h-5 sm:w-5 ${textColor} shrink-0`} />
        <span className={`text-sm font-semibold ${textColor}`}>Billing Cycle</span>
        <Badge className={`text-xs ${badgeClass}`}>{label}</Badge>
      </div>
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm ${textColor} flex-1`}>
        {formatted && <span>Expires: <strong>{formatted}</strong></span>}
        {daysLeft > 0 && <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>}
        {isExpired && <span className="font-medium">Please renew your subscription</span>}
      </div>
      <Link
        href={`/${orgSlug}/dashboard/billing/subscription`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${btnClass} transition-colors shrink-0`}
      >
        {isExpired ? 'Renew Now' : 'Manage Billing'}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
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

  // Fetch SMS balance for current user's organization
  const { data: smsBalance } = useTenantSmsBalance();

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

      {/* Billing Cycle Banner */}
      <BillingCycleBanner cycle={data?.billing_cycle} />

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatsCard title="Amount this month" value={`Ksh ${data?.billing?.total_revenue?.toLocaleString() ?? 0}`} icon={Wallet} />
        <StatsCard title="SMS balance" value={`Ksh ${smsBalance?.current_balance?.toLocaleString() ?? 0}`} icon={MessageSquare} />
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
        <div className="min-w-160">
          <PackagePerformanceTable data={charts?.package_performance} />
        </div>
      </div>
    </div>
  );
}
