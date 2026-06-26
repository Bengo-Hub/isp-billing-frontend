'use client';

import { Card } from '@/components/ui/card';
import { usePlatformDashboard, useRevenueChart, useTopOrganizations, useOrganizationGrowth } from '@/features/platform/api';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { StatCard } from '@/components/platform/StatCard';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PlatformDashboard() {
  const { data: dashboard, isLoading: isDashboardLoading } = usePlatformDashboard();
  const { data: revenueChart } = useRevenueChart(30);
  const { data: topOrganizations } = useTopOrganizations(5);
  const { data: growthData } = useOrganizationGrowth(6);

  if (isDashboardLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-600">Overview of your ISP platform</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600">Overview of your ISP platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Organizations"
          value={dashboard?.total_organizations || 0}
          subtitle={`${dashboard?.active_organizations || 0} active, ${dashboard?.trial_organizations || 0} trial`}
          icon={Building2}
          color="pink"
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(dashboard?.total_revenue_this_month || 0)}
          subtitle={`vs ${formatCurrency(dashboard?.total_revenue_last_month || 0)} last month`}
          icon={DollarSign}
          trend={dashboard?.revenue_growth_percentage && dashboard.revenue_growth_percentage > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(dashboard?.revenue_growth_percentage || 0).toFixed(1)}%`}
          color="green"
        />
        <StatCard
          title="End Customers"
          value={dashboard?.total_end_customers?.toLocaleString() || 0}
          subtitle={`${dashboard?.active_end_customers?.toLocaleString() || 0} active subscribers`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Collection Rate"
          value={`${dashboard?.collection_rate?.toFixed(1) || 100}%`}
          subtitle={`${formatCurrency(dashboard?.pending_payments || 0)} pending`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New Signups</p>
              <p className="text-xl font-bold">{dashboard?.new_signups_this_month || 0}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Churn Rate</p>
              <p className="text-xl font-bold">{dashboard?.churn_rate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500">{dashboard?.churn_this_month || 0} churned this month</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue Payments</p>
              <p className="text-xl font-bold">{formatCurrency(dashboard?.overdue_payments || 0)}</p>
              <p className="text-xs text-gray-500">{dashboard?.suspended_organizations || 0} suspended orgs</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
            <select className="text-sm border rounded px-2 py-1">
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {revenueChart && revenueChart.length > 0 ? (
              <div className="w-full h-full p-4">
                {/* Simple bar representation */}
                <div className="flex items-end justify-between h-48 gap-1">
                  {revenueChart.slice(-14).map((day, i) => {
                    const maxRevenue = Math.max(...revenueChart.map(d => d.revenue));
                    const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-brand-500 rounded-t transition-all hover:bg-brand-600"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${day.date}: ${formatCurrency(day.revenue)}`}
                      />
                    );
                  })}
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">Last 14 days</div>
              </div>
            ) : (
              <p className="text-gray-500">No revenue data available</p>
            )}
          </div>
        </Card>

        {/* Top Organizations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Organizations</h3>
            <Link href="/platform/organizations" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {topOrganizations && topOrganizations.length > 0 ? (
              topOrganizations.map((org, i) => (
                <div key={org.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.customers} customers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(org.revenue)}</p>
                    <p className="text-xs text-gray-500">{org.organization_type}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No organizations yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Organization Growth */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Organization Growth</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-500">Month</th>
                <th className="text-right py-2 font-medium text-gray-500">New Signups</th>
                <th className="text-right py-2 font-medium text-gray-500">Churned</th>
                <th className="text-right py-2 font-medium text-gray-500">Net Growth</th>
                <th className="text-right py-2 font-medium text-gray-500">Total Active</th>
              </tr>
            </thead>
            <tbody>
              {growthData && growthData.length > 0 ? (
                growthData.map((month) => (
                  <tr key={month.date} className="border-b">
                    <td className="py-3">{month.date}</td>
                    <td className="text-right py-3 text-green-600">+{month.new_signups}</td>
                    <td className="text-right py-3 text-red-600">-{month.churned}</td>
                    <td className={`text-right py-3 font-medium ${
                      month.new_signups - month.churned >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {month.new_signups - month.churned >= 0 ? '+' : ''}{month.new_signups - month.churned}
                    </td>
                    <td className="text-right py-3 font-medium">{month.total_active}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No growth data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
