import { api } from '@/lib/api';
import { getDevFallback } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export type DashboardAnalytics = {
  subscriptions: Record<string, any>;
  billing: Record<string, any>;
  routers: Record<string, any>;
  tickets: Record<string, any>;
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
  generated_at: new Date().toISOString(),
};

export function useDashboardAnalytics(options?: { refetchInterval?: number; refetchIntervalInBackground?: boolean }) {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async (): Promise<DashboardAnalytics> => {
      try {
        const { data } = await api.get('/reports/analytics/dashboard');
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
