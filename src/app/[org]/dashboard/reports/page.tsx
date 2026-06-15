'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useBillingAnalytics,
  useExportReport,
  useRouterAnalytics,
  useSubscriptionAnalytics,
  useTicketAnalytics,
  useUserAnalytics
} from '@/features/reports/api';
import { Calendar, Download, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data: subscriptionAnalytics } = useSubscriptionAnalytics(dateRange);
  const { data: billingAnalytics } = useBillingAnalytics(dateRange);
  const { data: routerAnalytics } = useRouterAnalytics(dateRange);
  const { data: ticketAnalytics } = useTicketAnalytics(dateRange);
  const { data: userAnalytics } = useUserAnalytics(dateRange);
  // gated: backend endpoint not implemented (POST /reports/export). Keep hook
  // wired but disable the export actions below until the backend ships it.
  const { mutate: exportReport, isPending: isExporting } = useExportReport();
  const EXPORT_DISABLED = true; // gated: backend endpoint not implemented

  const handleExport = (reportType: string, format: 'pdf' | 'excel' | 'csv') => {
    if (EXPORT_DISABLED) return; // gated: backend endpoint not implemented
    exportReport({
      report_type: reportType as any,
      format,
      filters: dateRange,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your ISP operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Date Range Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Quick Select</Label>
            <Select
              onValueChange={(value) => {
                const now = new Date();
                let startDate = new Date();
                
                switch (value) {
                  case 'today':
                    startDate = now;
                    break;
                  case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                  case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                  case 'quarter':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                  case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                }
                
                setDateRange({
                  start_date: startDate.toISOString().split('T')[0],
                  end_date: now.toISOString().split('T')[0],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full bg-brand-600 hover:bg-brand-700">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs for Different Report Types */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="routers">Routers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end">
            {/* gated: backend endpoint not implemented (POST /reports/export) */}
            <Button
              onClick={() => handleExport('comprehensive', 'pdf')}
              disabled={EXPORT_DISABLED || isExporting}
              title="Coming soon"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Overview (PDF) — Coming soon
            </Button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                KES {billingAnalytics?.total_revenue?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-green-600 mt-2">↑ 12% from last period</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Active Subscriptions</h3>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {subscriptionAnalytics?.active_subscriptions || 0}
              </div>
              <p className="text-sm text-blue-600 mt-2">
                {subscriptionAnalytics?.total_subscriptions || 0} total
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Online Routers</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {routerAnalytics?.online_routers || 0} / {routerAnalytics?.total_routers || 0}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {routerAnalytics?.average_uptime?.toFixed(2) || 0}% avg uptime
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {userAnalytics?.active_users || 0}
              </div>
              <p className="text-sm text-purple-600 mt-2">
                +{userAnalytics?.new_users_this_month || 0} this month
              </p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={billingAnalytics?.daily_revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Revenue (KES)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userAnalytics?.user_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('subscriptions', 'excel')}
              disabled={EXPORT_DISABLED || isExporting}
              title="Coming soon"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export Excel (Coming soon)
            </Button>
            <Button
              onClick={() => handleExport('subscriptions', 'pdf')}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export PDF (Coming soon)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total</h3>
              <div className="text-3xl font-bold text-gray-900">
                {subscriptionAnalytics?.total_subscriptions || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active</h3>
              <div className="text-3xl font-bold text-green-600">
                {subscriptionAnalytics?.active_subscriptions || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Expired</h3>
              <div className="text-3xl font-bold text-red-600">
                {subscriptionAnalytics?.expired_subscriptions || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
              <div className="text-3xl font-bold text-yellow-600">
                {subscriptionAnalytics?.pending_subscriptions || 0}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={subscriptionAnalytics?.subscription_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Subscriptions" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Plans by Revenue</h3>
              <div className="space-y-3">
                {subscriptionAnalytics?.top_plans?.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{plan.plan_name}</div>
                      <div className="text-sm text-gray-600">{plan.count} subscriptions</div>
                    </div>
                    <Badge variant="outline">KES {plan.revenue?.toLocaleString()}</Badge>
                  </div>
                )) || <p className="text-gray-500 text-center py-8">No data available</p>}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('billing', 'excel')}
              disabled={EXPORT_DISABLED || isExporting}
              title="Coming soon"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export Excel (Coming soon)
            </Button>
            <Button
              onClick={() => handleExport('billing', 'pdf')}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export PDF (Coming soon)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
              <div className="text-3xl font-bold text-gray-900">
                KES {billingAnalytics?.total_revenue?.toLocaleString() || '0'}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Paid</h3>
              <div className="text-3xl font-bold text-green-600">
                KES {billingAnalytics?.paid_revenue?.toLocaleString() || '0'}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
              <div className="text-3xl font-bold text-yellow-600">
                KES {billingAnalytics?.pending_revenue?.toLocaleString() || '0'}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Failed Payments</h3>
              <div className="text-3xl font-bold text-red-600">
                {billingAnalytics?.failed_payments || 0}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={billingAnalytics?.daily_revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="Revenue (KES)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={billingAnalytics?.revenue_by_method || []}
                    dataKey="amount"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {billingAnalytics?.revenue_by_method?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Routers Tab */}
        <TabsContent value="routers" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('routers', 'excel')}
              disabled={EXPORT_DISABLED || isExporting}
              title="Coming soon"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export Excel (Coming soon)
            </Button>
            <Button
              onClick={() => handleExport('routers', 'pdf')}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export PDF (Coming soon)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Routers</h3>
              <div className="text-3xl font-bold text-gray-900">
                {routerAnalytics?.total_routers || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Online</h3>
              <div className="text-3xl font-bold text-green-600">
                {routerAnalytics?.online_routers || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Uptime</h3>
              <div className="text-3xl font-bold text-blue-600">
                {routerAnalytics?.average_uptime?.toFixed(2) || 0}%
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Router Utilization</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routerAnalytics?.router_utilization || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="router_name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="users" fill="#8884d8" name="Active Users" />
                <Bar yAxisId="right" dataKey="bandwidth" fill="#82ca9d" name="Bandwidth (Mbps)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('users', 'excel')}
              disabled={EXPORT_DISABLED || isExporting}
              title="Coming soon"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export Excel (Coming soon)
            </Button>
            <Button
              onClick={() => handleExport('users', 'pdf')}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export PDF (Coming soon)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
              <div className="text-3xl font-bold text-gray-900">
                {userAnalytics?.total_users || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active Users</h3>
              <div className="text-3xl font-bold text-green-600">
                {userAnalytics?.active_users || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">New This Week</h3>
              <div className="text-3xl font-bold text-blue-600">
                {userAnalytics?.new_users_this_week || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">New This Month</h3>
              <div className="text-3xl font-bold text-purple-600">
                {userAnalytics?.new_users_this_month || 0}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userAnalytics?.user_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Plan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userAnalytics?.users_by_plan || []}
                    dataKey="count"
                    nameKey="plan_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {userAnalytics?.users_by_plan?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('tickets', 'excel')}
              disabled={EXPORT_DISABLED || isExporting}
              title="Coming soon"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export Excel (Coming soon)
            </Button>
            <Button
              onClick={() => handleExport('tickets', 'pdf')}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {/* gated: backend endpoint not implemented (POST /reports/export) */}
              Export PDF (Coming soon)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tickets</h3>
              <div className="text-3xl font-bold text-gray-900">
                {ticketAnalytics?.total_tickets || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Open</h3>
              <div className="text-3xl font-bold text-yellow-600">
                {ticketAnalytics?.open_tickets || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Closed</h3>
              <div className="text-3xl font-bold text-green-600">
                {ticketAnalytics?.closed_tickets || 0}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Resolution Time</h3>
              <div className="text-3xl font-bold text-blue-600">
                {ticketAnalytics?.average_resolution_time || 0}h
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ticketAnalytics?.ticket_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketAnalytics?.ticket_by_category || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
