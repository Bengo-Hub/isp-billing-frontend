import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// =============================================================================
// Platform Billing Types
// =============================================================================

export interface PlatformInvoice {
  id: number;
  invoice_number: string;
  organization_id: number;
  organization_name?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  billing_cycle: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
}

export interface PlatformPayment {
  id: number;
  organization_id: number;
  organization_name?: string;
  invoice_id?: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface BillingStats {
  total_invoiced: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  pending_invoice_count: number;
  overdue_invoice_count: number;
  paid_invoice_count: number;
}

export interface WhatsAppSubscription {
  id: number;
  organization_id: number;
  organization_name: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  provider_type: string;
  start_date: string;
  end_date: string;
  next_billing_date: string;
  is_trial: boolean;
  trial_end_date?: string;
  messages_sent_this_month: number;
  total_messages_sent: number;
}

// =============================================================================
// Platform Invoices
// =============================================================================

export function usePlatformInvoices(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  organization_id?: number;
}) {
  return useQuery({
    queryKey: ['platform-invoices', params],
    queryFn: async () => {
      const { data } = await api.get('/platform/billing/invoices', { params });
      return data;
    },
  });
}

export function usePlatformBillingStats() {
  return useQuery({
    queryKey: ['platform-billing-stats'],
    queryFn: async (): Promise<BillingStats> => {
      const { data } = await api.get('/platform/billing/invoices/stats');
      return data;
    },
  });
}

export function useGeneratePlatformInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/platform/billing/invoices/generate-monthly');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['platform-billing-stats'] });
      toast.success(`Generated ${data.generated_count || 0} invoices`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate invoices');
    },
  });
}

// =============================================================================
// Platform Payments
// =============================================================================

export function usePlatformPayments(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  organization_id?: number;
}) {
  return useQuery({
    queryKey: ['platform-payments', params],
    queryFn: async () => {
      const { data } = await api.get('/platform/billing/payments', { params });
      return data;
    },
  });
}

export function usePlatformPaymentDetails(paymentId?: number) {
  return useQuery({
    queryKey: ['platform-payment', paymentId],
    queryFn: async (): Promise<PlatformPayment> => {
      if (!paymentId) throw new Error('Payment ID required');
      const { data } = await api.get(`/platform/billing/payments/${paymentId}`);
      return data;
    },
    enabled: !!paymentId,
  });
}

// =============================================================================
// Refunds
// =============================================================================

export interface RefundRequest {
  amount?: number; // Leave empty for full refund
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  refund_reference?: string;
  refunded_amount?: number;
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, data }: { paymentId: number; data: RefundRequest }): Promise<RefundResponse> => {
      const response = await api.post(`/platform/billing/payments/${paymentId}/refund`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-payments'] });
      queryClient.invalidateQueries({ queryKey: ['platform-payment'] });
      if (data.success) {
        toast.success(data.message || 'Refund processed successfully');
      } else {
        toast.error(data.message || 'Refund failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to process refund');
    },
  });
}

// =============================================================================
// WhatsApp Subscriptions
// =============================================================================

export function usePlatformWhatsAppSubscriptions(params?: {
  status?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['platform-whatsapp-subscriptions', params],
    queryFn: async (): Promise<WhatsAppSubscription[]> => {
      const { data } = await api.get('/platform/whatsapp/subscriptions', { params });
      return data;
    },
  });
}

// =============================================================================
// Export Functions
// =============================================================================

export function useExportPlatformData() {
  return useMutation({
    mutationFn: async ({ type, params }: { type: 'invoices' | 'payments'; params?: Record<string, any> }) => {
      const endpoint = type === 'invoices'
        ? '/platform/billing/invoices/export'
        : '/platform/billing/payments/export';

      const response = await api.get(endpoint, {
        params,
        responseType: 'blob',
      });

      // Create download link
      const filename = `platform-${type}-${new Date().toISOString().split('T')[0]}.csv`;
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
      toast.success('Export downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export data');
    },
  });
}
