import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// =========================================================================
// Types
// =========================================================================

export interface WhatsAppGatewayConfig {
  id: number;
  provider_type: string;
  name: string;
  description?: string;
  status: string;
  is_active: boolean;
  is_primary: boolean;
  environment: string;
  webhook_url?: string;
  total_messages: number;
  total_cost: number;
  last_message_at?: string;
  last_error?: string;
  created_at: string;
  verified_at?: string;
  has_credentials: boolean;
}

export interface WhatsAppGatewayCreateData {
  api_key: string;
  environment?: string;
  webhook_url?: string;
}

export interface WhatsAppGatewayTestData {
  phone_number: string;
  test_message?: string;
}

export interface WhatsAppSubscription {
  id: number;
  organization_id: number;
  organization_name: string;
  status: string;
  provider_type: string;
  start_date: string;
  end_date: string;
  next_billing_date: string;
  is_trial: boolean;
  trial_end_date?: string;
  messages_sent_this_month: number;
  total_messages_sent: number;
  monthly_fee: number;
  currency: string;
}

export interface WhatsAppAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  total_messages_this_month: number;
  total_messages_all_time: number;
  total_revenue_this_month: number;
  total_revenue_all_time: number;
  top_organizations: Array<{
    name: string;
    message_count: number;
  }>;
  messages_by_day: Array<{
    date: string;
    count: number;
  }>;
}

// =========================================================================
// WhatsApp Gateway Hooks
// =========================================================================

export function useWhatsAppGateway() {
  return useQuery({
    queryKey: ['platform-whatsapp-gateway'],
    queryFn: async (): Promise<WhatsAppGatewayConfig | null> => {
      const { data } = await api.get('/platform/whatsapp/gateway');
      return data;
    },
  });
}

export function useSaveWhatsAppGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WhatsAppGatewayCreateData) => {
      const response = await api.post('/platform/whatsapp/gateway', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-whatsapp-gateway'] });
      toast.success('WhatsApp gateway configuration saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save WhatsApp gateway configuration');
    },
  });
}

export function useTestWhatsAppGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WhatsAppGatewayTestData) => {
      const response = await api.post('/platform/whatsapp/gateway/test', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-whatsapp-gateway'] });
      toast.success(data.message || 'Test message sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send test message');
    },
  });
}

export function useDeleteWhatsAppGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/platform/whatsapp/gateway');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-whatsapp-gateway'] });
      toast.success('WhatsApp gateway deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete WhatsApp gateway');
    },
  });
}

// =========================================================================
// WhatsApp Subscriptions Hooks
// =========================================================================

export function useWhatsAppSubscriptions(status?: string, skip: number = 0, limit: number = 100) {
  return useQuery({
    queryKey: ['platform-whatsapp-subscriptions', status, skip, limit],
    queryFn: async (): Promise<WhatsAppSubscription[]> => {
      const params: any = { skip, limit };
      if (status) params.status = status;
      const { data } = await api.get('/platform/whatsapp/subscriptions', { params });
      return data;
    },
  });
}

// =========================================================================
// WhatsApp Analytics Hooks
// =========================================================================

export function useWhatsAppAnalytics() {
  return useQuery({
    queryKey: ['platform-whatsapp-analytics'],
    queryFn: async (): Promise<WhatsAppAnalytics> => {
      const { data } = await api.get('/platform/whatsapp/analytics');
      return data;
    },
  });
}
