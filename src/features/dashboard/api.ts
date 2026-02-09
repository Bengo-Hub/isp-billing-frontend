import { api } from '@/lib/api';
import { getDevFallback } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export type BillingCycle = {
  is_trial: boolean;
  trial_days_remaining: number;
  is_subscription_active: boolean;
  subscription_days_remaining: number;
  subscription_ends_at: string | null;
  trial_ends_at: string | null;
  status: string | null;
};

export type DashboardAnalytics = {
  subscriptions: Record<string, any>;
  billing: Record<string, any>;
  routers: Record<string, any>;
  tickets: Record<string, any>;
  billing_cycle: BillingCycle | null;
  generated_at: string;
};

export type DashboardCharts = {
  payments_chart: Array<{ month: string; payments: number; expenses: number }>;
  active_users_chart: Array<{ day: string; hotspot: number; pppoe: number }>;
  retention_chart: Array<{ month: string; newC: number; returning: number; churned: number }>;
  data_usage_chart: Array<{ date: string; hotspot: number; pppoe: number }>;
  package_utilization_chart: Array<{ name: string; value: number }>;
  revenue_forecast_chart: Array<{ month: string; revenue?: number; forecast?: number }>;
  sms_sent_chart: Array<{ day: string; sent: number }>;
  network_usage_chart: Array<{ day: string; download: number; upload: number }>;
  registrations_chart: Array<{ day: string; users: number }>;
  most_active_users: Array<{ username: string; data: string; phone: string }>;
  package_performance: Array<{
    name: string;
    price: string;
    active: number;
    monthlyRevenue: string;
    avgUsage: string;
    arpu: string;
  }>;
  generated_at: string;
};

// Fallback data for development/demo only
const fallback: DashboardAnalytics = {
  subscriptions: {
    total_subscriptions: 1280,
    active_subscriptions: 1123,
    expired_subscriptions: 157,
  },
  billing: {
    total_invoices: 3420,
    total_revenue: 98543,
    paid_invoices: 3120,
    pending_invoices: 200,
    overdue_invoices: 100,
    collection_rate: 91.2,
    average_invoice_amount: 42.5,
  },
  routers: {
    total_routers: 2,
    online_routers: 1,
    offline_routers: 1,
  },
  tickets: {
    total_tickets: 12,
    open_tickets: 4,
    resolved_tickets: 7,
    closed_tickets: 1,
  },
  billing_cycle: null,
  generated_at: new Date().toISOString(),
};

export function useDashboardAnalytics(
  params?: { router_id?: number | null },
  options?: { refetchInterval?: number; refetchIntervalInBackground?: boolean }
) {
  return useQuery({
    queryKey: ['dashboard-analytics', params?.router_id],
    queryFn: async (): Promise<DashboardAnalytics> => {
      try {
        const { data } = await api.get('/reports/analytics/dashboard', {
          params: params?.router_id ? { router_id: params.router_id } : undefined,
        });
        return data;
      } catch {
        // Only return fallback in development, throw in production
        return getDevFallback(fallback);
      }
    },
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground,
  });
}

export function useDashboardCharts(
  params?: { router_id?: number | null },
  options?: { refetchInterval?: number; refetchIntervalInBackground?: boolean }
) {
  return useQuery({
    queryKey: ['dashboard-charts', params?.router_id],
    queryFn: async (): Promise<DashboardCharts> => {
      const { data } = await api.get('/reports/analytics/dashboard-charts', {
        params: params?.router_id ? { router_id: params.router_id } : undefined,
      });
      return data;
    },
    staleTime: 60_000,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground,
  });
}
