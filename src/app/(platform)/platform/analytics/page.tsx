'use client';

import { Card } from '@/components/ui/card';
import { useFullAnalytics } from '@/features/platform/api';
import { TrendingUp, Building2, Users, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/platform/StatCard';

export default function PlatformAnalyticsPage() {
  const { data, isLoading } = useFullAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform-wide analytics and insights</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboard = data?.dashboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Platform-wide analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard inline title="Total Organizations" value={dashboard?.total_organizations || 0} icon={Building2} color="pink" />
        <StatCard inline title="Monthly Revenue" value={`KES ${(dashboard?.total_revenue_this_month || 0).toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard inline title="End Customers" value={(dashboard?.total_end_customers || 0).toLocaleString()} icon={Users} color="blue" />
        <StatCard inline title="Growth Rate" value={`${(dashboard?.revenue_growth_percentage || 0).toFixed(1)}%`} icon={TrendingUp} color="orange" />
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
        <div className="h-64 flex items-end justify-between gap-1">
          {data?.revenue_chart && data.revenue_chart.length > 0 ? (
            data.revenue_chart.slice(-30).map((day, i) => {
              const maxRevenue = Math.max(...data.revenue_chart.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-brand-500 rounded-t hover:bg-brand-600 transition-colors cursor-pointer"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${day.date}: KES ${day.revenue.toLocaleString()}`}
                />
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">Last 30 days</div>
      </Card>

      {/* Organization Growth */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Organization Growth</h2>
        {data?.organization_growth && data.organization_growth.length > 0 ? (
          <div className="space-y-6">
            {/* Line Chart */}
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-4">
                {data.organization_growth.map((month, i) => {
                  const maxValue = Math.max(...data.organization_growth.map(m => m.total_active));
                  const height = maxValue > 0 ? (month.total_active / maxValue) * 100 : 0;
                  const netGrowth = month.new_signups - month.churned;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      {/* Bar */}
                      <div
                        className="w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t hover:from-brand-600 hover:to-brand-500 transition-all cursor-pointer shadow-sm"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${month.date}: ${month.total_active} active orgs\nNew: +${month.new_signups}, Churned: -${month.churned}, Net: ${netGrowth >= 0 ? '+' : ''}${netGrowth}`}
                      >
                        {/* Growth indicator badge */}
                        {month.new_signups > 0 && (
                          <div className="w-full flex justify-center pt-1">
                            <span className="text-xs font-bold text-white bg-green-500 px-1 rounded">
                              +{month.new_signups}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Month label */}
                      <span className="text-xs text-gray-500 mt-1">{month.date.slice(-2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-500 rounded"></div>
                <span className="text-gray-600">Total Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">New Signups</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  +{data.organization_growth.reduce((sum, m) => sum + m.new_signups, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Signups</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  -{data.organization_growth.reduce((sum, m) => sum + m.churned, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Churned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-600">
                  {data.organization_growth[data.organization_growth.length - 1]?.total_active || 0}
                </p>
                <p className="text-sm text-gray-500">Currently Active</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No growth data available
          </div>
        )}
      </Card>

      {/* Top Organizations */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top Performing Organizations</h2>
        <div className="space-y-3">
          {data?.top_organizations && data.top_organizations.length > 0 ? (
            data.top_organizations.map((org, i) => (
              <div key={org.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-sm font-medium text-brand-600">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-gray-500">{org.customers} customers • {org.organization_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">KES {org.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">No organizations yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
