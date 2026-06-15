import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type PaymentItem = {
  id: number;
  amount: number;
  status: string;
  method: string;
  invoice_id: number;
  user_id: number;
  transaction_id?: string;
  created_at: string;
};

export interface Invoice {
  id: number;
  invoice_number: string;
  user_id: number;
  subscription_id?: number;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  created_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

const paymentsFallback = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  pages: 0,
};

const invoicesFallback = {
  invoices: [],
  total: 0,
  page: 1,
  size: 10,
  pages: 0,
};

// Payments
export function usePayments(params: { page?: number; size?: number; user_id?: number; invoice_id?: number; status?: string }) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async (): Promise<{ items: PaymentItem[]; total: number; page: number; size: number; pages: number }> => {
      try {
        const { data } = await api.get('/billing/payments', { params });
        return data;
      } catch {
        return paymentsFallback;
      }
    },
  });
}

export function usePayment(paymentId: number) {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async (): Promise<PaymentItem> => {
      const { data } = await api.get(`/billing/payments/${paymentId}`);
      return data;
    },
    enabled: !!paymentId,
  });
}

// Record Payment (admin-only offline / manual reconciliation)
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mpesa' | 'card' | 'other';

export interface RecordPaymentInput {
  user_id: number;
  invoice_id?: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
}

/**
 * Record a manual / offline payment (admin only).
 *
 * When `payment_method` is an offline method (cash / bank_transfer / other) AND an
 * `invoice_id` is supplied, the backend marks that invoice PAID, activates the linked
 * subscription, and syncs it to the router. Linking an invoice is what triggers activation.
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordPaymentInput): Promise<PaymentItem> => {
      const { data } = await api.post('/billing/payments', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-pending'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-overdue'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to record payment');
    },
  });
}

// Invoices
export function useInvoices(params: { page?: number; size?: number; user_id?: number; status?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async (): Promise<{ invoices: Invoice[]; total: number; page: number; size: number; pages: number }> => {
      try {
        const { data } = await api.get('/billing/invoices', { params });
        return data;
      } catch {
        return invoicesFallback;
      }
    },
  });
}

export function useInvoice(invoiceId: number) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async (): Promise<Invoice> => {
      const { data } = await api.get(`/billing/invoices/${invoiceId}`);
      return data;
    },
    enabled: !!invoiceId,
  });
}

export function useOverdueInvoices(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['invoices-overdue', params],
    queryFn: async (): Promise<{ invoices: Invoice[]; total: number }> => {
      const { data } = await api.get('/billing/invoices/overdue', { params });
      return data;
    },
  });
}

export function usePendingInvoices(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['invoices-pending', params],
    queryFn: async (): Promise<{ invoices: Invoice[]; total: number }> => {
      const { data } = await api.get('/billing/invoices/pending', { params });
      return data;
    },
  });
}

export function usePaidInvoices(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['invoices-paid', params],
    queryFn: async (): Promise<{ invoices: Invoice[]; total: number }> => {
      const { data } = await api.get('/billing/invoices/paid', { params });
      return data;
    },
  });
}

// Generate Invoices
export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/billing/invoices/generate');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(`${data.generated_count || 0} invoices generated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate invoices');
    },
  });
}

export function useGenerateSubscriptionInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      const response = await api.post(`/billing/invoices/generate/subscription/${subscriptionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate invoice');
    },
  });
}

// Download Invoice
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await api.get(`/billing/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      
      const filename = `invoice_${invoiceId}.pdf`;
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
      toast.success('Invoice downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to download invoice');
    },
  });
}

// Email Invoice
export function useEmailInvoice() {
  return useMutation({
    mutationFn: async ({ invoiceId, email }: { invoiceId: number; email?: string }) => {
      const response = await api.post(`/billing/invoices/${invoiceId}/email`, { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Invoice emailed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to email invoice');
    },
  });
}

// Mark Invoice as Paid
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await api.patch(`/billing/invoices/${invoiceId}/mark-paid`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to mark invoice as paid');
    },
  });
}

// Cancel Invoice
export function useCancelInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await api.patch(`/billing/invoices/${invoiceId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel invoice');
    },
  });
}

// Download Receipt
export function useDownloadReceipt() {
  return useMutation({
    mutationFn: async (paymentId: number) => {
      const response = await api.get(`/billing/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      });

      const filename = `receipt_${paymentId}.pdf`;
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
      toast.success('Receipt downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to download receipt');
    },
  });
}

// =============================================================================
// Subscription Renewal
// =============================================================================

export interface SubscriptionRenewalRequest {
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface PlatformInvoice {
  id: number;
  organization_id: number;
  invoice_number: string;
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
  status: string;
  due_date: string;
  paid_at?: string;
  paystack_reference?: string;
  notes?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Renew subscription by creating a platform invoice for the ISP admin's organization.
 * This must be called before initiating Paystack payment.
 */
export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubscriptionRenewalRequest): Promise<PlatformInvoice> => {
      const response = await api.post('/billing/subscription/renew', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-invoices'] });
      toast.success('Renewal invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create renewal invoice');
    },
  });
}

// =============================================================================
// Paystack Payment Integration
// =============================================================================

export interface PaystackInitiateRequest {
  invoice_id: number;
  callback_url: string;
  email?: string;
  phone?: string;
}

export interface PaystackInitiateResponse {
  success: boolean;
  checkout_url?: string;
  reference?: string;
  access_code?: string;
  error?: string;
}

export interface PaystackVerifyResponse {
  success: boolean;
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  message: string;
  data?: {
    reference?: string;
    amount?: number;
    currency?: string;
    paid_at?: string;
    channel?: string;
  };
}

// Initiate Paystack Payment
export function useInitiatePaystackPayment() {
  return useMutation({
    mutationFn: async (data: PaystackInitiateRequest): Promise<PaystackInitiateResponse> => {
      const response = await api.post('/payments/paystack/initiate', data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    },
  });
}

// Verify Paystack Payment
export function useVerifyPaystackPayment(reference: string) {
  return useQuery({
    queryKey: ['paystack-verify', reference],
    queryFn: async (): Promise<PaystackVerifyResponse> => {
      const { data } = await api.get(`/payments/paystack/verify/${reference}`);
      return data;
    },
    enabled: !!reference,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// List Banks for Paystack
export function usePaystackBanks(country: string = 'kenya') {
  return useQuery({
    queryKey: ['paystack-banks', country],
    queryFn: async (): Promise<any[]> => {
      const { data } = await api.get(`/payments/paystack/banks/${country}`);
      // Paystack wraps the list as { status, message, data: [...] }.
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
    enabled: !!country,
  });
}

// Resolve Bank Account
export function useResolvePaystackAccount() {
  return useMutation({
    mutationFn: async ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }) => {
      const response = await api.get('/payments/paystack/resolve-account', {
        params: { account_number: accountNumber, bank_code: bankCode },
      });
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to resolve account');
    },
  });
}

// =============================================================================
// Available Payment Gateways
// =============================================================================

export interface AvailableGateway {
  id: number;
  gateway_type: 'paystack' | 'mpesa_paybill' | 'mpesa_till' | 'manual';
  name: string;
  display_name: string;
  is_active: boolean;
  is_primary: boolean;
  environment?: string;
  paybill_number?: string | null;
  till_number?: string | null;
  // legacy/optional (not sent by the backend; kept for defensive consumers)
  description?: string;
  is_available?: boolean;
}

/**
 * Get available payment gateways for current organization.
 * Returns only active gateways configured by platform admin.
 */
export function useAvailablePaymentGateways() {
  return useQuery({
    queryKey: ['available-payment-gateways'],
    queryFn: async (): Promise<AvailableGateway[]> => {
      try {
        const { data } = await api.get('/payment-gateways/available');
        const list: AvailableGateway[] = Array.isArray(data) ? data : (data?.data ?? []);
        // Backend marks usable gateways with `is_active` (there is no `is_available`).
        return list.filter((g) => g.is_active ?? g.is_available ?? true);
      } catch (error: any) {
        console.warn('Failed to fetch payment gateways:', error);
        // Return empty array if fails - no fallback, just show what's available
        return [];
      }
    },
  });
}

// =============================================================================
// M-PESA Payment Integration
// =============================================================================

export interface MpesaPaymentRequest {
  amount: number;
  phone_number: string;
  account_reference: string;
  description: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkout_request_id?: string;
  merchant_request_id?: string;
  customer_message?: string;
  error?: string;
}

/**
 * Initiate M-PESA STK Push payment.
 */
export function useInitiateMpesaPayment() {
  return useMutation({
    mutationFn: async (request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> => {
      const { data } = await api.post('/mpesa/initiate-payment', request);
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate M-PESA payment');
    },
  });
}

/**
 * Get M-PESA payment status by checkout request ID.
 */
export function useMpesaPaymentStatus(checkoutRequestId?: string) {
  return useQuery({
    queryKey: ['mpesa-payment-status', checkoutRequestId],
    queryFn: async (): Promise<Record<string, any> | null> => {
      if (!checkoutRequestId) return null;
      const { data } = await api.get(`/mpesa/payment-status/${checkoutRequestId}`);
      return data;
    },
    enabled: !!checkoutRequestId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if payment is still pending
      const status = query.state.data?.status;
      if (status === 'PENDING' || status === 'PROCESSING') {
        return 3000;
      }
      return false; // Stop polling when complete
    },
  });
}

// =============================================================================
// Payment Statistics
// =============================================================================

export interface PaymentStats {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  total_amount: number;
  mpesa_payments: number;
  cash_payments: number;
  bank_transfer_payments: number;
  daily_earnings: number;
  weekly_earnings: number;
  monthly_earnings: number;
}

/**
 * Get payment statistics including daily, weekly, and monthly earnings.
 */
export function usePaymentStats() {
  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: async (): Promise<PaymentStats> => {
      const { data } = await api.get('/billing/payments/stats');
      return data;
    },
  });
}
