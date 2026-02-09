import { api } from '@/lib/api';
import { getDevFallback } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type PlanItem = {
  id: number;
  name: string;
  plan_type: string;
  price: number;
  currency: string;
  is_active: boolean;
  speed?: string;
  duration?: string;
  device_count?: number;
  enable_burst?: boolean;
  enable_schedule?: boolean;
  start_time?: string;
  end_time?: string;
};

// Fallback data for development/demo only
const plansFallback = {
  items: [
    { 
      id: 1, 
      name: '2HR SURF UNLIMITED', 
      plan_type: 'hotspot', 
      price: 10, 
      currency: 'KES', 
      is_active: true,
      speed: '3M/3M',
      duration: '2 Hours',
      device_count: 1,
      enable_burst: false,
      enable_schedule: false
    },
    { 
      id: 2, 
      name: '7HRS UNLIMITED', 
      plan_type: 'hotspot', 
      price: 20, 
      currency: 'KES', 
      is_active: true,
      speed: '3M/3M',
      duration: '7 Hours',
      device_count: 1,
      enable_burst: false,
      enable_schedule: false
    },
    { 
      id: 3, 
      name: 'Wiki Smart (5 DAYS +...', 
      plan_type: 'hotspot', 
      price: 100, 
      currency: 'KES', 
      is_active: true,
      speed: '5M/5M',
      duration: '6 Days',
      device_count: 1,
      enable_burst: true,
      enable_schedule: false
    },
    { 
      id: 4, 
      name: '1 Month LITE Home Un...', 
      plan_type: 'pppoe', 
      price: 1500, 
      currency: 'KES', 
      is_active: true,
      speed: '10M/10M',
      duration: '1 Month',
      device_count: 1,
      enable_burst: false,
      enable_schedule: false
    },
    { 
      id: 5, 
      name: '1 Month LITE Busines...', 
      plan_type: 'pppoe', 
      price: 2000, 
      currency: 'KES', 
      is_active: true,
      speed: '15M/15M',
      duration: '1 Month',
      device_count: 1,
      enable_burst: true,
      enable_schedule: true,
      start_time: '08:00',
      end_time: '18:00'
    },
  ],
  total: 5,
  page: 1,
  size: 5,
  pages: 1,
};

export function usePlans(params: { page?: number; size?: number; plan_type?: string; search?: string }) {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: async (): Promise<{ items: PlanItem[]; total: number; page: number; size: number; pages: number }> => {
      try {
        const { data } = await api.get('/plans/', { params });

        // Normalize plan types: backend uses UPPERCASE, frontend uses lowercase
        // Also map 'INTERNET' → 'data' for consistency
        const normalizedPlans = (data.plans || []).map((plan: any) => ({
          ...plan,
          plan_type: plan.plan_type?.toLowerCase() === 'internet'
            ? 'data'
            : plan.plan_type?.toLowerCase() || 'data'
        }));

        // Transform backend response: { plans: [...] } → { items: [...] }
        return {
          items: normalizedPlans,
          total: data.total || 0,
          page: data.page || 1,
          size: data.size || 20,
          pages: data.pages || 1,
        };
      } catch {
        // Only return fallback in development, throw in production
        return getDevFallback(plansFallback as any);
      }
    },
  });
}

export function usePlan(planId: number) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: async (): Promise<PlanItem> => {
      const { data } = await api.get(`/plans/${planId}`);
      return data;
    },
    enabled: !!planId,
  });
}

export interface PlanCreateData {
  name: string;
  description?: string;
  plan_type: 'INTERNET' | 'HOTSPOT' | 'PPPOE' | 'BOTH';
  price: number;
  currency?: string;
  billing_cycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  download_speed: number;
  upload_speed: number;
  data_limit?: number;
  data_limit_type?: string;
  time_limit?: number;
  time_limit_type?: string;
  validity_days?: number;
  concurrent_sessions?: number;
  enable_burst?: boolean;
  burst_download?: number;
  burst_upload?: number;
  burst_threshold?: number;
  burst_time?: number;
  enable_schedule?: boolean;
  schedule_start_time?: string;
  schedule_end_time?: string;
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: PlanCreateData) => {
      const response = await api.post('/plans/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Package created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create package');
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planId, data }: { planId: number; data: Partial<PlanCreateData> }) => {
      const response = await api.patch(`/plans/${planId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Package updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update package');
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: number) => {
      await api.delete(`/plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Package deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete package');
    },
  });
}

export function useActivatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await api.patch(`/plans/${planId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Package activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to activate package');
    },
  });
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await api.patch(`/plans/${planId}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Package deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to deactivate package');
    },
  });
}

// Bulk Operations for Packages
export function useBulkUpdatePlanPrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planIds, priceAdjustment }: { planIds: number[]; priceAdjustment: number }) => {
      // Get all plans and update their prices
      const promises = planIds.map(planId =>
        api.patch(`/plans/${planId}`, { price_adjustment: priceAdjustment })
      );
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(`${variables.planIds.length} packages updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update packages');
    },
  });
}

export function useBulkActivatePlans() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planIds: number[]) => {
      const promises = planIds.map(planId => api.patch(`/plans/${planId}/activate`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, planIds) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(`${planIds.length} packages activated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to activate packages');
    },
  });
}

export function useBulkDeactivatePlans() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planIds: number[]) => {
      const promises = planIds.map(planId => api.patch(`/plans/${planId}/deactivate`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, planIds) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(`${planIds.length} packages deactivated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to deactivate packages');
    },
  });
}

export function useBulkDeletePlans() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planIds: number[]) => {
      const promises = planIds.map(planId => api.delete(`/plans/${planId}`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, planIds) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(`${planIds.length} packages deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete packages');
    },
  });
}
