import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type SMSBalance = {
  account_id: number;
  account_name: string;
  current_balance: number;
  currency: string;
  is_low_balance: boolean;
  today_usage: any;
  recent_transactions: any[];
};

const balanceFallback: SMSBalance = {
  account_id: 1,
  account_name: 'Primary SMS Account',
  current_balance: 1234,
  currency: 'KES',
  is_low_balance: false,
  today_usage: { sent: 45, failed: 2 },
  recent_transactions: [
    { id: 1, amount: 1000, method: 'mpesa', date: new Date().toISOString() },
    { id: 2, amount: 2000, method: 'card', date: new Date().toISOString() },
  ],
};

const analyticsFallback = Array.from({ length: 30 }).map((_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  sent: Math.floor(Math.random() * 100),
  failed: Math.floor(Math.random() * 5),
}));

export function useSmsBalance(accountId: number) {
  return useQuery({
    queryKey: ['sms-balance', accountId],
    queryFn: async (): Promise<SMSBalance> => {
      try {
        const { data } = await api.get(`/sms-credit/accounts/${accountId}/balance`);
        return data;
      } catch {
        return balanceFallback;
      }
    },
    enabled: !!accountId,
  });
}

// Tenant-aware SMS balance - gets balance for current user's organization
export function useTenantSmsBalance() {
  return useQuery({
    queryKey: ['tenant-sms-balance'],
    queryFn: async (): Promise<SMSBalance> => {
      try {
        const { data } = await api.get('/tenant/messages/sms-balance');
        return data;
      } catch {
        return {
          account_id: 0,
          account_name: 'No Account',
          current_balance: 0,
          currency: 'KES',
          is_low_balance: true,
          today_usage: { sent: 0, failed: 0 },
          recent_transactions: [],
        };
      }
    },
  });
}

export function useSmsAnalytics(accountId: number, days = 30) {
  return useQuery({
    queryKey: ['sms-analytics', accountId, days],
    queryFn: async (): Promise<Record<string, any>> => {
      try {
        const { data } = await api.get(`/sms-credit/accounts/${accountId}/analytics`, { params: { days } });
        return data;
      } catch {
        return analyticsFallback as any;
      }
    },
    enabled: !!accountId,
  });
}

export function useTopUpSms(accountId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, payment_method }: { amount: number; payment_method: string }) => {
      const { data } = await api.post(`/sms-credit/accounts/${accountId}/top-up`, {
        amount,
        payment_method,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sms-balance', accountId] });
      qc.invalidateQueries({ queryKey: ['sms-analytics', accountId] });
    },
  });
}

// End-to-end MPESA top-up flow: initiate payment -> create top-up record -> poll -> process
export function useMpesaTopUpFlow(accountId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, phoneNumber }: { amount: number; phoneNumber: string }) => {
      // 1) Initiate MPESA STK push
      const payInit = await api.post('/mpesa/initiate-payment', {
        amount: Math.round(amount),
        phone_number: phoneNumber, // TODO: validate phone number
        account_reference: `SMS${accountId}`,
        description: 'SMS Top-up',
      });

      const checkoutId: string = payInit.data.checkout_request_id;

      // 2) Create SMS top-up record referencing the MPESA checkout ID
      const topup = await api.post(`/sms-credit/accounts/${accountId}/top-up`, {
        amount,
        payment_method: 'mpesa',
        payment_reference: checkoutId,
      });

      const topUpId: number = topup.data.id;

      // 3) Poll MPESA status until success/failure (max ~90s)
      const start = Date.now();
      let status = 'PENDING';
      let mpesaTransactionId: string | null = null;

      while (Date.now() - start < 90_000) {
        // eslint-disable-next-line no-await-in-loop
        const res = await api.get(`/mpesa/payment-status/${checkoutId}`);
        status = res.data?.status || 'PENDING';
        if (status === 'COMPLETED' || status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELLED') {
          mpesaTransactionId = res.data?.mpesa_response?.MerchantRequestID || res.data?.mpesa_response?.TransactionID || null;
          break;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 3000));
      }

      if (status !== 'COMPLETED' && status !== 'SUCCESS') {
        throw new Error(`MPESA payment not successful: ${status}`);
      }

      // 4) Process the top-up in backend to apply the balance
      await api.post(`/sms-credit/top-ups/${topUpId}/process`, null, {
        params: { external_transaction_id: mpesaTransactionId || checkoutId },
      });

      return { checkoutId, topUpId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sms-balance', accountId] });
      qc.invalidateQueries({ queryKey: ['sms-analytics', accountId] });
    },
  });
}

// Send SMS
export interface SendSMSRequest {
  to_phone: string;
  message: string;
}

export function useSendSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendSMSRequest) => {
      const response = await api.post('/notifications/sms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-balance'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('SMS sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send SMS');
    },
  });
}

// Send Bulk SMS
export interface BulkSMSRequest {
  recipients: string[];
  message: string;
  sender_id?: string;
  schedule_at?: string;
}

export function useSendBulkSMS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: BulkSMSRequest) => {
      const response = await api.post('/notifications/sms/bulk', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sms-balance'] });
      toast.success(`Bulk SMS queued for ${data.queued_count || 0} recipients`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send bulk SMS');
    },
  });
}

// SMS Templates
export interface SMSTemplate {
  id: number;
  name: string;
  message: string;
  variables: string[];
  category: string;
  is_active: boolean;
}

export function useSMSTemplates() {
  return useQuery({
    queryKey: ['sms-templates'],
    queryFn: async (): Promise<SMSTemplate[]> => {
      const { data } = await api.get('/notifications/templates/sms');
      return data.templates || [];
    },
  });
}

export function useCreateSMSTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<SMSTemplate, 'id'>) => {
      const response = await api.post('/notifications/templates/sms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('SMS template created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create template');
    },
  });
}

export function useUpdateSMSTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: number; data: Partial<SMSTemplate> }) => {
      const response = await api.patch(`/notifications/templates/sms/${templateId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('SMS template updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update template');
    },
  });
}

export function useDeleteSMSTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateId: number) => {
      await api.delete(`/notifications/templates/sms/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete template');
    },
  });
}

// SMS History
export function useSMSHistory(params?: { page?: number; size?: number; status?: string }) {
  return useQuery({
    queryKey: ['sms-history', params],
    queryFn: async (): Promise<{ items: any[]; total: number }> => {
      const { data } = await api.get('/sms-credit/history', { params });
      return data;
    },
  });
}

// Messages List (for Messages page)
export interface Message {
  id: number;
  user: string | null;
  phone: string;
  channel: string;
  message: string;
  delivered: boolean;
  cost: number;
  sent: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  page_size: number;
}

export function useMessages(params?: { page?: number; page_size?: number; search?: string; channel?: string }) {
  return useQuery({
    queryKey: ['messages', params],
    queryFn: async (): Promise<MessagesResponse> => {
      try {
        const { data } = await api.get('/tenant/messages', { params });
        return data;
      } catch {
        // Return empty fallback if API fails
        return {
          messages: [],
          total: 0,
          page: params?.page || 1,
          page_size: params?.page_size || 20,
        };
      }
    },
  });
}

export function useMessage(messageId: number) {
  return useQuery({
    queryKey: ['message', messageId],
    queryFn: async (): Promise<Message | null> => {
      try {
        const { data } = await api.get(`/tenant/messages/${messageId}`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!messageId,
  });
}

// Paystack SMS Top-up
export interface PaystackSMSTopUpRequest {
  amount: number;
  email: string;
  callback_url?: string;
}

export interface PaystackSMSTopUpResponse {
  success: boolean;
  message: string;
  checkout_url?: string;
  reference?: string;
  top_up_id?: number;
  sms_credits?: number;
}

export function usePaystackSmsTopUp(accountId: number, orgSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaystackSMSTopUpRequest): Promise<PaystackSMSTopUpResponse> => {
      // Construct callback URL pointing to our success page
      const callbackUrl = typeof window !== 'undefined' && orgSlug
        ? `${window.location.origin}/${orgSlug}/dashboard/messages/sms-topup-success`
        : (data.callback_url || `${window.location.origin}/messages/sms-topup-success`);

      const response = await api.post(`/sms-credit/accounts/${accountId}/paystack-top-up`, {
        ...data,
        callback_url: callbackUrl,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.checkout_url) {
        // Redirect to Paystack checkout
        window.location.href = data.checkout_url;
      } else if (!data.success) {
        toast.error(data.message);
      }
      queryClient.invalidateQueries({ queryKey: ['sms-balance', accountId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-sms-balance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate top-up');
    },
  });
}

// Tenant-aware SMS top-up - automatically uses the current user's organization
export function useTenantSmsTopUp(orgSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaystackSMSTopUpRequest): Promise<PaystackSMSTopUpResponse> => {
      // Construct callback URL pointing to our success page
      const callbackUrl = typeof window !== 'undefined' && orgSlug
        ? `${window.location.origin}/${orgSlug}/dashboard/messages/sms-topup-success`
        : (data.callback_url || `${window.location.origin}/messages/sms-topup-success`);

      const response = await api.post('/tenant/messages/sms-topup', {
        ...data,
        callback_url: callbackUrl,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.checkout_url) {
        // Redirect to Paystack checkout
        window.location.href = data.checkout_url;
      } else if (!data.success) {
        toast.error(data.message);
      }
      queryClient.invalidateQueries({ queryKey: ['tenant-sms-balance'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate top-up');
    },
  });
}
