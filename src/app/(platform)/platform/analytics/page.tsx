'use client';

import { Card } from '@/components/ui/card';
import { useFullAnalytics } from '@/features/platform/api';
import { TrendingUp, Building2, Users, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-lg">
              <Building2 className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Organizations</p>
              <p className="text-xl font-bold">{dashboard?.total_organizations || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-xl font-bold">KES {(dashboard?.total_revenue_this_month || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">End Customers</p>
              <p className="text-xl font-bold">{(dashboard?.total_end_customers || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Growth Rate</p>
              <p className="text-xl font-bold">{(dashboard?.revenue_growth_percentage || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
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
                  className="flex-1 bg-pink-500 rounded-t hover:bg-pink-600 transition-colors cursor-pointer"
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
              {data?.organization_growth && data.organization_growth.length > 0 ? (
                data.organization_growth.map((month) => (
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

      {/* Top Organizations */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top Performing Organizations</h2>
        <div className="space-y-3">
          {data?.top_organizations && data.top_organizations.length > 0 ? (
            data.top_organizations.map((org, i) => (
              <div key={org.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm font-medium text-pink-600">
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
