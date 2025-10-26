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
