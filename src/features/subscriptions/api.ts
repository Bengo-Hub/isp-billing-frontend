import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type SubscriptionStatus = 'pending' | 'active' | 'suspended' | 'expired' | 'cancelled';
export type SubscriptionType = 'hotspot' | 'pppoe';

export interface SubscriptionItem {
  id: number;
  user_id: number;
  plan_id: number;
  router_id: number;
  subscription_type: SubscriptionType;
  username: string;
  password: string;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  is_active: boolean;
  is_expired: boolean;
  is_auto_renewal: boolean;
  is_router_synced: boolean;
  bytes_uploaded: number;
  bytes_downloaded: number;
  total_bytes_used: number;
  total_data_used_gb: number;
  session_count: number;
  last_activity?: string;
  last_router_sync?: string;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  // Joined fields from API
  plan_name?: string;
  router_name?: string;
  user_phone?: string;
}

export interface SubscriptionCreateData {
  user_id: number;
  plan_id: number;
  router_id: number;
  subscription_type: SubscriptionType;
  username: string;
  password: string;
  start_date: string;
  end_date: string;
  is_auto_renewal?: boolean;
  notes?: string;
}

export interface SubscriptionUpdateData {
  plan_id?: number;
  router_id?: number;
  subscription_type?: SubscriptionType;
  username?: string;
  password?: string;
  start_date?: string;
  end_date?: string;
  is_auto_renewal?: boolean;
  notes?: string;
}

export interface SubscriptionStats {
  subscription_id: number;
  username: string;
  status: string;
  total_bytes_used: number;
  total_data_used_gb: number;
  session_count: number;
  monthly_uploaded: number;
  monthly_downloaded: number;
  last_activity?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_expired: boolean;
}

export interface SubscriptionUsageLog {
  id: number;
  subscription_id: number;
  log_date: string;
  bytes_uploaded: number;
  bytes_downloaded: number;
  session_duration: number;
  ip_address?: string;
  mac_address?: string;
  created_at: string;
}

export interface SubscriptionHistory {
  id: number;
  subscription_id: number;
  action: string;
  details?: string;
  changed_by?: number;
  created_at: string;
}

export interface SubscriptionListResponse {
  subscriptions: SubscriptionItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface SubscriptionFilters {
  page?: number;
  size?: number;
  user_id?: number;
  plan_id?: number;
  router_id?: number;
  status?: SubscriptionStatus;
  subscription_type?: SubscriptionType;
  search?: string;
}

// Fetch all subscriptions with filters
export function useSubscriptions(params: SubscriptionFilters = {}) {
  return useQuery({
    queryKey: ['subscriptions', params],
    queryFn: async (): Promise<SubscriptionListResponse> => {
      const { data } = await api.get('/subscriptions/', { params });
      return data;
    },
  });
}

// Fetch single subscription
export function useSubscription(subscriptionId: number) {
  return useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: async (): Promise<SubscriptionItem> => {
      const { data } = await api.get(`/subscriptions/${subscriptionId}`);
      return data;
    },
    enabled: !!subscriptionId,
  });
}

// Fetch subscription stats
export function useSubscriptionStats(subscriptionId: number) {
  return useQuery({
    queryKey: ['subscription-stats', subscriptionId],
    queryFn: async (): Promise<SubscriptionStats> => {
      const { data } = await api.get(`/subscriptions/${subscriptionId}/stats`);
      return data;
    },
    enabled: !!subscriptionId,
  });
}

// Fetch subscription usage logs
export function useSubscriptionUsage(subscriptionId: number, limit = 100) {
  return useQuery({
    queryKey: ['subscription-usage', subscriptionId, limit],
    queryFn: async (): Promise<SubscriptionUsageLog[]> => {
      const { data } = await api.get(`/subscriptions/${subscriptionId}/usage`, {
        params: { limit },
      });
      return data;
    },
    enabled: !!subscriptionId,
  });
}

// Fetch subscription history
export function useSubscriptionHistory(subscriptionId: number) {
  return useQuery({
    queryKey: ['subscription-history', subscriptionId],
    queryFn: async (): Promise<SubscriptionHistory[]> => {
      const { data } = await api.get(`/subscriptions/${subscriptionId}/history`);
      return data;
    },
    enabled: !!subscriptionId,
  });
}

// Fetch user's subscriptions
export function useUserSubscriptions(userId: number, activeOnly = false) {
  return useQuery({
    queryKey: ['user-subscriptions', userId, activeOnly],
    queryFn: async (): Promise<SubscriptionItem[]> => {
      const { data } = await api.get(`/subscriptions/user/${userId}`, {
        params: { active_only: activeOnly },
      });
      return data;
    },
    enabled: !!userId,
  });
}

// Fetch expired subscriptions
export function useExpiredSubscriptions() {
  return useQuery({
    queryKey: ['expired-subscriptions'],
    queryFn: async (): Promise<SubscriptionItem[]> => {
      const { data } = await api.get('/subscriptions/expired/');
      return data;
    },
  });
}

// Fetch expiring subscriptions
export function useExpiringSubscriptions(days = 7) {
  return useQuery({
    queryKey: ['expiring-subscriptions', days],
    queryFn: async (): Promise<SubscriptionItem[]> => {
      const { data } = await api.get('/subscriptions/expiring/', {
        params: { days },
      });
      return data;
    },
  });
}

// Create subscription
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubscriptionCreateData) => {
      const response = await api.post('/subscriptions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create subscription');
    },
  });
}

// Update subscription
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, data }: { subscriptionId: number; data: SubscriptionUpdateData }) => {
      const response = await api.patch(`/subscriptions/${subscriptionId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update subscription');
    },
  });
}

// Delete subscription
export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const response = await api.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete subscription');
    },
  });
}

// Activate subscription
export function useActivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const response = await api.patch(`/subscriptions/${subscriptionId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to activate subscription');
    },
  });
}

// Suspend subscription
export function useSuspendSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: number; reason?: string }) => {
      const response = await api.patch(`/subscriptions/${subscriptionId}/suspend`, {
        subscription_id: subscriptionId,
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to suspend subscription');
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, reason }: { subscriptionId: number; reason?: string }) => {
      const response = await api.patch(`/subscriptions/${subscriptionId}/cancel`, {
        subscription_id: subscriptionId,
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel subscription');
    },
  });
}

// Renew subscription
export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, newEndDate, notes }: { subscriptionId: number; newEndDate: string; notes?: string }) => {
      const response = await api.post(`/subscriptions/${subscriptionId}/renew`, {
        subscription_id: subscriptionId,
        new_end_date: newEndDate,
        notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription renewed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to renew subscription');
    },
  });
}

// Bulk operations
export function useBulkActivateSubscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionIds: number[]) => {
      const promises = subscriptionIds.map(id =>
        api.patch(`/subscriptions/${id}/activate`)
      );
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, subscriptionIds) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`${subscriptionIds.length} subscriptions activated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to activate subscriptions');
    },
  });
}

export function useBulkSuspendSubscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionIds, reason }: { subscriptionIds: number[]; reason?: string }) => {
      const promises = subscriptionIds.map(id =>
        api.patch(`/subscriptions/${id}/suspend`, { subscription_id: id, reason })
      );
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`${variables.subscriptionIds.length} subscriptions suspended successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to suspend subscriptions');
    },
  });
}

export function useBulkDeleteSubscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionIds: number[]) => {
      const promises = subscriptionIds.map(id => api.delete(`/subscriptions/${id}`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, subscriptionIds) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success(`${subscriptionIds.length} subscriptions deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete subscriptions');
    },
  });
}

// Sync subscription to router
export function useSyncSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const response = await api.post(`/subscriptions/${subscriptionId}/sync`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription synced to router successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to sync subscription to router');
    },
  });
}
