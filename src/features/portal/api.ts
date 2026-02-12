import { api } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';

// =========================================================================
// Types
// =========================================================================

export interface PortalConfig {
  organization_name: string;
  logo_url?: string;
  primary_color: string;
  portal_title?: string;
  portal_description?: string;
  email?: string;
  phone?: string;
  show_packages: boolean;
  allow_guest_purchases: boolean;
  redirect_url?: string;
}

export interface HotspotPackage {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  validity_days: number;
  download_speed: number;
  upload_speed: number;
  data_limit: number;
  time_limit: number;
  is_unlimited_data: boolean;
  is_unlimited_time: boolean;
  is_popular: boolean;
  features: string[];
}

export interface PurchaseRequest {
  plan_id: number;
  phone_number?: string;
  email?: string;
  payment_method?: string;  // 'mpesa' | 'paystack'
}

export interface PurchaseResponse {
  success: boolean;
  reference: string;
  message: string;
  instructions?: string;
  checkout_url?: string;
  status: string;
}

export interface VoucherRedeemRequest {
  code: string;
  mac_address?: string;
}

export interface VoucherRedeemResponse {
  success: boolean;
  message: string;
  plan_name?: string;
  validity_hours?: number;
  expires_at?: string;
}

export interface SessionStatus {
  is_active: boolean;
  plan_name?: string;
  started_at?: string;
  expires_at?: string;
  time_remaining_seconds?: number;
  data_used_mb?: number;
  data_limit_mb?: number;
}

export interface PaymentStatus {
  status: string;
  message?: string;
  is_completed: boolean;
  username?: string;
  password?: string;
  voucher_code?: string;
}

// =========================================================================
// Hotspot Portal Hooks
// =========================================================================

/**
 * Get portal configuration for an organization.
 * Public endpoint - no authentication required.
 */
export function usePortalConfig(orgSlug: string) {
  return useQuery({
    queryKey: ['portal-config', orgSlug],
    queryFn: async (): Promise<PortalConfig> => {
      const response = await api.get<PortalConfig>(`/portal/hotspot/${orgSlug}/config`);
      // Portal endpoint returns raw object, not wrapped in { data: ... }
      return response.data || response;
    },
    enabled: !!orgSlug,
  });
}

/**
 * Get available hotspot packages for an organization.
 * Public endpoint - no authentication required.
 */
export function useHotspotPackages(orgSlug: string) {
  return useQuery({
    queryKey: ['hotspot-packages', orgSlug],
    queryFn: async (): Promise<HotspotPackage[]> => {
      const response = await api.get<HotspotPackage[]>(`/portal/hotspot/${orgSlug}/packages`);
      // Portal endpoint returns raw array, not wrapped in { data: ... }
      return Array.isArray(response) ? response : response.data || [];
    },
    enabled: !!orgSlug,
  });
}

/**
 * Purchase a hotspot package via M-PESA.
 * Initiates STK push to customer's phone.
 */
export function usePurchasePackage(orgSlug: string) {
  return useMutation({
    mutationFn: async (request: PurchaseRequest): Promise<PurchaseResponse> => {
      const { data } = await api.post(`/portal/hotspot/${orgSlug}/purchase`, request);
      return data;
    },
  });
}

/**
 * Redeem a voucher code.
 * Activates session for the voucher.
 */
export function useRedeemVoucher(orgSlug: string) {
  return useMutation({
    mutationFn: async (request: VoucherRedeemRequest): Promise<VoucherRedeemResponse> => {
      const { data } = await api.post(`/portal/hotspot/${orgSlug}/voucher/redeem`, request);
      return data;
    },
  });
}

/**
 * Check session status.
 */
export function useSessionStatus(orgSlug: string, sessionToken?: string) {
  return useQuery({
    queryKey: ['session-status', orgSlug, sessionToken],
    queryFn: async (): Promise<SessionStatus> => {
      const { data } = await api.get(`/portal/hotspot/${orgSlug}/session/status`, {
        params: { session_token: sessionToken },
      });
      return data;
    },
    enabled: !!orgSlug && !!sessionToken,
  });
}

/**
 * Check payment status by reference.
 */
export function usePaymentStatus(orgSlug: string, reference?: string) {
  return useQuery({
    queryKey: ['payment-status', orgSlug, reference],
    queryFn: async (): Promise<PaymentStatus> => {
      // Normalize responses from portal endpoints which sometimes return
      // either `{ success, data }` or a plain payload object.
      const resp = await api.get(`/portal/hotspot/${orgSlug}/payment/status`, {
        params: { reference },
      });
      const payload: PaymentStatus = (resp && (resp as any).data) ? (resp as any).data : (resp as any);
      return payload;
    },
    enabled: !!orgSlug && !!reference,
    refetchInterval: (query) => {
      // Poll every 5 seconds until payment is completed
      if (query.state.data?.is_completed) {
        return false;
      }
      return 5000;
    },
  });
}

// =========================================================================
// Hotspot Login / Connect Hooks
// =========================================================================

export interface HotspotLoginRequest {
  username: string;
  password: string;
  mac_address?: string;
}

export interface HotspotLoginResponse {
  success: boolean;
  message: string;
  session_token?: string;
  /** MikroTik login URL the client should redirect to after auth. */
  login_url?: string;
  plan_name?: string;
  expires_at?: string;
  is_active: boolean;
}

/**
 * Hotspot customer login (username + password).
 * Used by the "Connect" tab on the captive portal for returning users
 * who already purchased a package or have active vouchers.
 *
 * Backend validates credentials → checks active subscription →
 * syncs MAC to MikroTik → returns login_url for redirect.
 */
export function useHotspotLogin(orgSlug: string) {
  return useMutation({
    mutationFn: async (request: HotspotLoginRequest): Promise<HotspotLoginResponse> => {
      const { data } = await api.post(`/portal/hotspot/${orgSlug}/login`, request);
      return data;
    },
  });
}

// =========================================================================
// PPPoE Portal Hooks
// =========================================================================

export interface PPPoELoginRequest {
  username: string;
  password: string;
}

export interface PPPoELoginResponse {
  success: boolean;
  token: string;
  user: {
    username: string;
    email?: string;
    phone_number?: string;
    current_plan?: string;
    expires_at?: string;
  };
}

export interface PPPoEDashboard {
  user?: {
    username: string;
    email?: string;
    phone_number?: string;
  };
  current_plan: {
    id?: number;
    name: string;
    expires_at: string;
    is_expired: boolean;
  } | null;
  usage: {
    download_gb: number;
    upload_gb: number;
    total_gb: number;
    limit_gb: number;
  };
  recent_payments: Array<{
    id: number;
    date: string;
    amount: number;
    currency: string;
    status: string;
    plan_name: string;
  }>;
}

export interface PPPoEPackage {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  validity_days: number;
  download_speed: number;
  upload_speed: number;
  data_limit: number;
  is_unlimited: boolean;
  features: string[];
}

/**
 * PPPoE customer login.
 */
export function usePPPoELogin(orgSlug: string) {
  return useMutation({
    mutationFn: async (request: PPPoELoginRequest): Promise<PPPoELoginResponse> => {
      const { data } = await api.post(`/portal/pppoe/${orgSlug}/login`, request);
      return data;
    },
  });
}

/**
 * Get PPPoE customer dashboard.
 */
export function usePPPoEDashboard(orgSlug: string, token?: string) {
  return useQuery({
    queryKey: ['pppoe-dashboard', orgSlug, token],
    queryFn: async (): Promise<PPPoEDashboard> => {
      const { data } = await api.get(`/portal/pppoe/${orgSlug}/dashboard`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      return data;
    },
    enabled: !!orgSlug && !!token,
  });
}

/**
 * Get available PPPoE packages for upgrade/renewal.
 */
export function usePPPoEPackages(orgSlug: string) {
  return useQuery({
    queryKey: ['pppoe-packages', orgSlug],
    queryFn: async (): Promise<PPPoEPackage[]> => {
      const { data } = await api.get(`/portal/pppoe/${orgSlug}/packages`);
      return data;
    },
    enabled: !!orgSlug,
  });
}

/**
 * Renew PPPoE subscription.
 */
export function usePPPoERenew(orgSlug: string) {
  return useMutation({
    mutationFn: async (request: { plan_id: number; phone_number: string }): Promise<PurchaseResponse> => {
      const { data } = await api.post(`/portal/pppoe/${orgSlug}/renew`, request);
      return data;
    },
  });
}
