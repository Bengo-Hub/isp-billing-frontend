import { api } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  plan_id?: number;
  router_id?: number;
  user_id?: number;
  status?: string;
  payment_method?: string;
  report_type?: string;
}

export interface SubscriptionAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  pending_subscriptions: number;
  revenue_trend: Array<{ date: string; revenue: number }>;
  subscription_growth: Array<{ date: string; count: number }>;
  top_plans: Array<{ plan_name: string; count: number; revenue: number }>;
}

export interface BillingAnalytics {
  total_revenue: number;
  pending_revenue: number;
  paid_revenue: number;
  failed_payments: number;
  revenue_by_method: Array<{ method: string; amount: number }>;
  daily_revenue: Array<{ date: string; amount: number }>;
  monthly_revenue: Array<{ month: string; amount: number }>;
}

export interface RouterAnalytics {
  total_routers: number;
  online_routers: number;
  offline_routers: number;
  average_uptime: number;
  router_utilization: Array<{ router_name: string; users: number; bandwidth: number }>;
  router_health: Array<{ router_id: number; status: string; cpu: number; memory: number }>;
}

export interface TicketAnalytics {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  pending_tickets: number;
  average_resolution_time: number;
  ticket_trend: Array<{ date: string; count: number }>;
  ticket_by_category: Array<{ category: string; count: number }>;
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  user_growth: Array<{ date: string; count: number }>;
  users_by_plan: Array<{ plan_name: string; count: number }>;
}

// Get Subscription Analytics
export function useSubscriptionAnalytics(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['subscription-analytics', filters],
    queryFn: async (): Promise<SubscriptionAnalytics> => {
      const { data } = await api.get('/reports/analytics/subscriptions', {
        params: filters,
      });
      return data;
    },
  });
}

// Get Billing Analytics
export function useBillingAnalytics(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['billing-analytics', filters],
    queryFn: async (): Promise<BillingAnalytics> => {
      const { data } = await api.get('/reports/analytics/billing', {
        params: filters,
      });
      return data;
    },
  });
}

// Get Router Analytics
export function useRouterAnalytics(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['router-analytics', filters],
    queryFn: async (): Promise<RouterAnalytics> => {
      const { data } = await api.get('/reports/analytics/routers', {
        params: filters,
      });
      return data;
    },
  });
}

// Get Ticket Analytics
export function useTicketAnalytics(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['ticket-analytics', filters],
    queryFn: async (): Promise<TicketAnalytics> => {
      const { data } = await api.get('/reports/analytics/tickets', {
        params: filters,
      });
      return data;
    },
  });
}

// Get User Analytics
export function useUserAnalytics(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['user-analytics', filters],
    queryFn: async (): Promise<UserAnalytics> => {
      const { data } = await api.get('/reports/analytics/users', {
        params: filters,
      });
      return data;
    },
  });
}

// Get Comprehensive Dashboard Analytics
export function useComprehensiveDashboard(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['comprehensive-dashboard', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/analytics/dashboard', {
        params: filters,
      });
      return data;
    },
  });
}

// Export Reports
export interface ExportReportRequest {
  report_type: 'subscriptions' | 'billing' | 'routers' | 'tickets' | 'users' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  filters?: ReportFilters;
}

export function useExportReport() {
  return useMutation({
    mutationFn: async (request: ExportReportRequest) => {
      const response = await api.post('/reports/export', request, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Determine file extension
      const extension = request.format === 'pdf' ? 'pdf' : request.format === 'excel' ? 'xlsx' : 'csv';
      link.setAttribute('download', `${request.report_type}_report_${new Date().toISOString().split('T')[0]}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export report');
    },
  });
}

// Schedule Report
export interface ScheduleReportRequest {
  report_type: string;
  format: 'pdf' | 'excel' | 'csv';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  filters?: ReportFilters;
}

export function useScheduleReport() {
  return useMutation({
    mutationFn: async (request: ScheduleReportRequest) => {
      const response = await api.post('/reports/schedule', request);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to schedule report');
    },
  });
}

// Get Report History
export function useReportHistory(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['report-history', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/history', { params });
      return data;
    },
  });
}

// Revenue Report
export function useRevenueReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['revenue-report', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/revenue', { params: filters });
      return data;
    },
  });
}

// Customer Report
export function useCustomerReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['customer-report', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/customers', { params: filters });
      return data;
    },
  });
}

// Payment Report
export function usePaymentReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['payment-report', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/payments', { params: filters });
      return data;
    },
  });
}

// Network Usage Report
export function useNetworkUsageReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['network-usage-report', filters],
    queryFn: async () => {
      const { data } = await api.get('/reports/network-usage', { params: filters });
      return data;
    },
  });
}

// Download Report by ID
export function useDownloadReport() {
  return useMutation({
    mutationFn: async (reportId: number) => {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      
      // Get filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `report_${reportId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to download report');
    },
  });
}

// Delete Report
export function useDeleteReport() {
  return useMutation({
    mutationFn: async (reportId: number) => {
      const response = await api.delete(`/reports/${reportId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete report');
    },
  });
}

