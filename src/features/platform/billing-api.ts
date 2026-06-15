import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// =============================================================================
// Platform Billing Types
//
// NOTE: Invoices, payments and refunds are OWNED by treasury-api. The platform
// billing screen here is a read-only continuity view; mutation flows (generate,
// refund, void, update, delete, regenerate, export) were removed in favour of
// the treasury console. The only write kept is initiating an ISP-provider's own
// subscription-invoice payment (Paystack checkout), used by PaystackPaymentDialog.
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
// Read-only queries (summary view)
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
// Platform Invoice Payment (ISP providers paying their own subscription invoice)
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
