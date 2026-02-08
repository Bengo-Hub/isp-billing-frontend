import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export type LicenceStatus = {
  organization_id: number;
  organization_name: string;
  status: string;
  is_trial: boolean;
  is_subscription_active: boolean;
  is_in_grace_period: boolean;
  is_suspended: boolean;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  trial_days_remaining: number;
  subscription_days_remaining: number;
  grace_period_days: number;
  grace_period_ends_at: string | null;
  licence_bypass: boolean;
  tier: {
    id: number;
    name: string;
    description: string;
    tier_type: string;
    base_monthly_fee: number;
    max_routers: number | null;
    max_staff_users: number | null;
    max_sms_per_month: number | null;
    features: Record<string, boolean>;
  } | null;
  usage: {
    routers: number | null;
    customers: number | null;
    staff: number | null;
  };
  platform: {
    company_name: string;
    email: string;
    phone: string | null;
    logo_url: string;
  };
};

export type PlatformInvoice = {
  id: number;
  invoice_number: string;
  billing_cycle: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  base_fee: number;
  earnings_fee: number;
  customer_fee: number;
  additional_fees: number;
  discount: number;
  tax: number;
  total_amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  created_at: string | null;
};

export type PlatformInvoicesResponse = {
  items: PlatformInvoice[];
  total: number;
  page: number;
  pages: number;
};

export function useLicenceStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['licence-status'],
    queryFn: async (): Promise<LicenceStatus> => {
      const { data } = await api.get<LicenceStatus>('/tenant/licence-status');
      return data;
    },
    staleTime: 60_000,
    enabled: options?.enabled !== false,
  });
}

export function usePlatformInvoices(page = 1, size = 10, status?: string) {
  return useQuery({
    queryKey: ['platform-invoices', page, size, status],
    queryFn: async (): Promise<PlatformInvoicesResponse> => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set('status', status);
      const { data } = await api.get<PlatformInvoicesResponse>(`/tenant/platform-invoices?${params}`);
      return data;
    },
    staleTime: 60_000,
  });
}
