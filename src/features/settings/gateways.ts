import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type GatewayType = 'payment' | 'sms';
export type PaymentProvider = 'mpesa';
export type SmsProvider = 'twilio' | 'africastalking';

export function useGatewayConfig(gateway: GatewayType, provider: string) {
  return useQuery({
    queryKey: ['gateway-config', gateway, provider],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/gateways/configuration/${gateway}/${provider}`);
        return data;
      } catch {
        // Fallback structure
        if (gateway === 'payment' && provider === 'mpesa') {
          return {
            configured: false,
            required_fields: ['consumer_key', 'consumer_secret', 'passkey', 'shortcode'],
            configuration: {},
          };
        }
        if (gateway === 'sms' && provider === 'twilio') {
          return { configured: false, required_fields: ['account_sid', 'auth_token', 'phone_number'], configuration: {} };
        }
        if (gateway === 'sms' && provider === 'africastalking') {
          return { configured: false, required_fields: ['username', 'api_key'], configuration: {} };
        }
        return { configured: false, required_fields: [], configuration: {} };
      }
    },
    staleTime: 60_000,
  });
}

export function useSaveGatewayConfig(gateway: GatewayType, provider: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: Record<string, string>) => {
      return (await api.post(`/gateways/configuration/${gateway}/${provider}`, config)).data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gateway-config', gateway, provider] });
    },
  });
}

export function useTestGateway(gateway: GatewayType, provider: string) {
  return useMutation({
    mutationFn: async (config?: Record<string, string>) => {
      const { data } = await api.post(`/gateways/configuration/${gateway}/${provider}/validate`, config ?? {});
      return data;
    },
  });
}

// =========================================================================
// Payout Configuration Types
// =========================================================================

export type PayoutScheduleType = 'instant' | 'daily' | 'weekly' | 'monthly';
export type PayoutRecipientType = 
  | 'nuban' 
  | 'ghipss' 
  | 'kepss' 
  | 'basa' 
  | 'mobile_money' 
  | 'mobile_money_business' 
  | 'authorization';

export interface PayoutRecipientTypeInfo {
  type: string;
  name: string;
  description: string;
  currency: string;
  supported_countries: string[];
  is_paystack_supported: boolean;
  is_enabled: boolean;
  required_fields: string[];
}

export interface PayoutScheduleTypeInfo {
  type: PayoutScheduleType;
  name: string;
  description: string;
  requires_day: boolean;
  day_options?: { value: number; label: string }[];
}

export interface PayoutConfig {
  id: number;
  schedule_type: string;
  schedule_description: string;
  payout_day: number | null;
  payout_time: string;
  recipient_type: string;
  recipient_code: string | null;
  recipient_name: string | null;
  bank_code: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  mobile_number: string | null;
  currency: string;
  is_active: boolean;
  is_verified: boolean;
  min_payout_amount: number;
  total_payouts: number;
  total_payout_amount: number;
  last_payout_at: string | null;
  last_payout_amount: number | null;
}

export interface PayoutConfigCreate {
  schedule_type: PayoutScheduleType;
  payout_day?: number;
  payout_time?: string;
  recipient_type: PayoutRecipientType;
  bank_code?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  mobile_number?: string;
  currency?: string;
  min_payout_amount?: number;
}

export interface PayoutConfigUpdate extends Partial<PayoutConfigCreate> {
  is_active?: boolean;
}

// =========================================================================
// Payout Configuration Hooks
// =========================================================================

export function usePayoutRecipientTypes() {
  return useQuery({
    queryKey: ['payout-recipient-types'],
    queryFn: async (): Promise<PayoutRecipientTypeInfo[]> => {
      const { data } = await api.get('/tenant/payment-gateways/payout/recipient-types');
      return data;
    },
    staleTime: 300_000, // Cache for 5 minutes
  });
}

export function usePayoutScheduleTypes() {
  return useQuery({
    queryKey: ['payout-schedule-types'],
    queryFn: async (): Promise<PayoutScheduleTypeInfo[]> => {
      const { data } = await api.get('/tenant/payment-gateways/payout/schedule-types');
      return data;
    },
    staleTime: 300_000,
  });
}

export function usePayoutConfig() {
  return useQuery({
    queryKey: ['payout-config'],
    queryFn: async (): Promise<PayoutConfig | null> => {
      try {
        const { data } = await api.get('/tenant/payment-gateways/payout/config');
        return data;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

export function useSavePayoutConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: PayoutConfigCreate) => {
      const { data } = await api.post('/tenant/payment-gateways/payout/config', config);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payout-config'] });
    },
  });
}

export function useUpdatePayoutConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: PayoutConfigUpdate) => {
      const { data } = await api.put('/tenant/payment-gateways/payout/config', config);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payout-config'] });
    },
  });
}

export function useDeletePayoutConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/tenant/payment-gateways/payout/config');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payout-config'] });
    },
  });
}

// =========================================================================
// Integration URL Configuration
// =========================================================================

export interface IntegrationUrls {
  backend_base: string;
  frontend_base: string;
  urls: Record<string, Record<string, string>>;
}

export interface IntegrationUrlsForProvider {
  base_url: string;
  urls: Record<string, string>;
}

export function useIntegrationUrls() {
  return useQuery({
    queryKey: ['integration-urls'],
    queryFn: async (): Promise<IntegrationUrls> => {
      const { data } = await api.get('/integrations/urls/');
      return data;
    },
    staleTime: 300_000, // Cache for 5 minutes
  });
}

export function useIntegrationUrlsForProvider(provider: string) {
  return useQuery({
    queryKey: ['integration-urls', provider],
    queryFn: async (): Promise<IntegrationUrlsForProvider> => {
      const { data } = await api.get(`/integrations/urls/${provider}`);
      return data;
    },
    staleTime: 300_000,
    enabled: !!provider,
  });
}

// =========================================================================
// Bank and Account Resolution
// =========================================================================

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface BankListResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

export interface ResolvedAccount {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface ResolveAccountResponse {
  status: boolean;
  message: string;
  data: ResolvedAccount;
}

export function useBanks(country: string = 'kenya') {
  return useQuery({
    queryKey: ['banks', country],
    queryFn: async (): Promise<Bank[]> => {
      const { data } = await api.get<BankListResponse>(`/payments/paystack/banks/${country}`);
      return data.data || [];
    },
    staleTime: 300_000, // Cache for 5 minutes
    enabled: !!country,
  });
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: async ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }): Promise<ResolvedAccount> => {
      const { data } = await api.get<ResolveAccountResponse>(`/payments/paystack/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`);
      return data.data;
    },
  });
}
