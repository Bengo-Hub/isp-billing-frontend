import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// =========================================================================
// Types
// =========================================================================

export type OrganizationType = 'hotspot' | 'pppoe' | 'hybrid';
export type OrganizationStatus = 'active' | 'suspended' | 'trial' | 'pending_payment';

export interface Organization {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  organization_type: OrganizationType;
  status: OrganizationStatus;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  logo_url?: string;
  primary_color: string;
  portal_domain?: string;
  subscription_tier_id?: number;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  max_routers: number;
  max_customers: number;
  max_users: number;
  total_revenue: number;
  total_customers: number;
  active_subscriptions: number;
  is_trial: boolean;
  trial_days_remaining: number;
  is_subscription_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListResponse {
  items: Organization[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface OrganizationStats {
  total_organizations: number;
  active_organizations: number;
  trial_organizations: number;
  suspended_organizations: number;
  pending_payment_organizations: number;
  total_revenue_this_month: number;
  new_organizations_this_month: number;
}

export interface DashboardStats {
  total_organizations: number;
  active_organizations: number;
  trial_organizations: number;
  suspended_organizations: number;
  total_revenue_this_month: number;
  total_revenue_last_month: number;
  revenue_growth_percentage: number;
  total_end_customers: number;
  active_end_customers: number;
  new_signups_this_month: number;
  churn_this_month: number;
  churn_rate: number;
  pending_payments: number;
  overdue_payments: number;
  collection_rate: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  invoiced: number;
  collected: number;
}

export interface OrganizationGrowthData {
  date: string;
  new_signups: number;
  churned: number;
  total_active: number;
}

export interface TopOrganization {
  id: number;
  name: string;
  slug: string;
  revenue: number;
  customers: number;
  organization_type: string;
}

export interface FullAnalytics {
  dashboard: DashboardStats;
  revenue_chart: RevenueChartData[];
  organization_growth: OrganizationGrowthData[];
  top_organizations: TopOrganization[];
}

export interface OrganizationCreateData {
  name: string;
  slug: string;
  organization_type: OrganizationType;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  primary_color?: string;
  subscription_tier_id?: number;
  trial_days?: number;
  max_routers?: number;
  max_customers?: number;
  max_users?: number;
}

export interface OrganizationUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  primary_color?: string;
  portal_domain?: string;
  subscription_tier_id?: number;
  max_routers?: number;
  max_customers?: number;
  max_users?: number;
  status?: OrganizationStatus;
}

export interface OrganizationFilters {
  status?: OrganizationStatus;
  organization_type?: OrganizationType;
  search?: string;
  page?: number;
  page_size?: number;
}

// =========================================================================
// Organization Hooks
// =========================================================================

export function useOrganizations(filters: OrganizationFilters = {}) {
  return useQuery({
    queryKey: ['platform-organizations', filters],
    queryFn: async (): Promise<OrganizationListResponse> => {
      const { data } = await api.get('/platform/organizations/', { params: filters });
      return data;
    },
  });
}

export function useOrganization(organizationId: number) {
  return useQuery({
    queryKey: ['platform-organization', organizationId],
    queryFn: async (): Promise<Organization> => {
      const { data } = await api.get(`/platform/organizations/${organizationId}`);
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useOrganizationStats() {
  return useQuery({
    queryKey: ['platform-organization-stats'],
    queryFn: async (): Promise<OrganizationStats> => {
      const { data } = await api.get('/platform/organizations/stats');
      return data;
    },
  });
}

export function useOrganizationEarnings(organizationId: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['platform-organization-earnings', organizationId, startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const { data } = await api.get(`/platform/organizations/${organizationId}/earnings`, { params });
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrganizationCreateData) => {
      const response = await api.post('/platform/organizations/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      toast.success('Organization created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create organization');
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, data }: { organizationId: number; data: OrganizationUpdateData }) => {
      const response = await api.patch(`/platform/organizations/${organizationId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-organization'] });
      toast.success('Organization updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update organization');
    },
  });
}

export function useSuspendOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, reason }: { organizationId: number; reason?: string }) => {
      const response = await api.post(`/platform/organizations/${organizationId}/suspend`, null, {
        params: { reason },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-organization'] });
      toast.success('Organization suspended');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to suspend organization');
    },
  });
}

export function useReactivateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: number) => {
      const response = await api.post(`/platform/organizations/${organizationId}/reactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-organization'] });
      toast.success('Organization reactivated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reactivate organization');
    },
  });
}

// =========================================================================
// Analytics Hooks
// =========================================================================

export function usePlatformDashboard() {
  return useQuery({
    queryKey: ['platform-dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data } = await api.get('/platform/analytics/dashboard');
      return data;
    },
  });
}

export function useRevenueChart(days: number = 30) {
  return useQuery({
    queryKey: ['platform-revenue-chart', days],
    queryFn: async (): Promise<RevenueChartData[]> => {
      const { data } = await api.get('/platform/analytics/revenue-chart', { params: { days } });
      return data;
    },
  });
}

export function useOrganizationGrowth(months: number = 12) {
  return useQuery({
    queryKey: ['platform-organization-growth', months],
    queryFn: async (): Promise<OrganizationGrowthData[]> => {
      const { data } = await api.get('/platform/analytics/organization-growth', { params: { months } });
      return data;
    },
  });
}

export function useTopOrganizations(limit: number = 10) {
  return useQuery({
    queryKey: ['platform-top-organizations', limit],
    queryFn: async (): Promise<TopOrganization[]> => {
      const { data } = await api.get('/platform/analytics/top-organizations', { params: { limit } });
      return data;
    },
  });
}

export function useFullAnalytics() {
  return useQuery({
    queryKey: ['platform-full-analytics'],
    queryFn: async (): Promise<FullAnalytics> => {
      const { data } = await api.get('/platform/analytics/');
      return data;
    },
  });
}
