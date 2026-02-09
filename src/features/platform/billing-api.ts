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
  billing_cycle: string;
  billing_period_start: string;
  billing_period_end: string;
  tier_id?: number;
  base_fee: number;
  earnings_during_period: number;
  earnings_fee: number;
  customer_count: number;
  customer_fee: number;
  additional_fees: number;
  discount: number;
  tax: number;
  total_amount: number;
  currency?: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  paystack_reference?: string;
  notes?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformPayment {
  id: number;
  organization_id: number;
  organization_name?: string;
  invoice_id?: number;
  payment_reference: string;
  amount: number;
  currency: string;
  paystack_reference?: string;
  paystack_channel?: string;
  card_last4?: string;
  card_brand?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  status_message?: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
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
// Invoice Management
// =============================================================================

export interface UpdateInvoiceRequest {
  amount?: number;
  due_date?: string;
  notes?: string;
}

export interface VoidInvoiceRequest {
  reason: string;
}

export interface RegenerateInvoiceResponse {
  success: boolean;
  message: string;
  old_amount?: number;
  new_amount?: number;
  invoice?: PlatformInvoice;
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: number; data: UpdateInvoiceRequest }) => {
      const response = await api.patch(`/platform/billing/invoices/${invoiceId}/update`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['platform-billing-stats'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update invoice');
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: number; data: VoidInvoiceRequest }) => {
      const response = await api.post(`/platform/billing/invoices/${invoiceId}/void`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['platform-billing-stats'] });
      toast.success('Invoice voided successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to void invoice');
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await api.delete(`/platform/billing/invoices/${invoiceId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['platform-billing-stats'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete invoice');
    },
  });
}

export function useRegenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: number): Promise<RegenerateInvoiceResponse> => {
      const response = await api.post(`/platform/billing/invoices/${invoiceId}/regenerate`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['platform-billing-stats'] });
      toast.success(data.message || 'Invoice regenerated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to regenerate invoice');
    },
  });
}

// =============================================================================
// Platform Invoice Payment
// =============================================================================

export interface PlatformPaymentInitiationRequest {
  callback_url: string;
  email: string;
}

export interface PlatformPaymentInitiationResponse {
  success: boolean;
  checkout_url?: string;
  reference?: string;
  access_code?: string;
  error?: string;
}

/**
 * Initiate payment for a platform invoice.
 * This endpoint is specifically for ISP providers to pay their subscription invoices.
 */
export function useInitiatePlatformInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      data,
    }: {
      invoiceId: number;
      data: PlatformPaymentInitiationRequest;
    }): Promise<PlatformPaymentInitiationResponse> => {
      const response = await api.post(`/platform/billing/invoices/${invoiceId}/pay`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['platform-payments'] });
      queryClient.invalidateQueries({ queryKey: ['platform-billing-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    },
  });
}

export interface PlatformPaymentVerificationResponse {
  success: boolean;
  status: string;
  message: string;
  invoice_id?: number;
  payment_id?: number;
}

/**
 * Verify a platform invoice payment by Paystack reference.
 */
export function useVerifyPlatformPayment(reference: string) {
  return useQuery({
    queryKey: ['platform-payment-verify', reference],
    queryFn: async (): Promise<PlatformPaymentVerificationResponse> => {
      const { data } = await api.get(`/platform/billing/payments/verify/${reference}`);
      return data;
    },
    enabled: !!reference,
    retry: false,
    refetchOnWindowFocus: false,
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
