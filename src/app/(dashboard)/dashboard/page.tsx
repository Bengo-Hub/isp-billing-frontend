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
import { Activity, MessageSquare, Users, Wallet } from 'lucide-react';

export default function DashboardPage() {
  // Enable real-time updates with 30-second polling
  const { data, isLoading, error } = useDashboardAnalytics({
    refetchInterval: 60000, // Refresh every 60 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not active
  });

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
        <StatsCard title="SMS balance" value={`Ksh ${1234}`} icon={MessageSquare} />
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
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment received</p>
                <p className="text-xs text-gray-500">12 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Router went offline</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </Card>

        <MostActiveUsersTable />
      </div>

      <div className="mt-6">
        <PackagePerformanceTable />
      </div>
    </div>
  );
}

