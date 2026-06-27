import { api } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

// =========================================================================
// Types
// =========================================================================

/**
 * Provider (ISP) contact details surfaced to end-customers when the provider's
 * own subscription has lapsed and the captive/portal buy flow is unavailable.
 */
export interface ProviderContact {
  name?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
}

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
  /**
   * False when the provider's (ISP's) own subscription has lapsed — the buy/
   * renew UI is then replaced with a friendly "temporarily unavailable" card.
   */
  provider_active?: boolean;
  /** Provider contact shown on the unavailable card so customers can reach them. */
  provider_contact?: ProviderContact;
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
  /** HOTSPOT / PPPOE / INTERNET / BOTH. */
  plan_type?: string;
  /** Number of simultaneous devices the package allows. */
  concurrent_sessions?: number;
  /**
   * Authoritative access window in MINUTES when set (> 0) — carries sub-day /
   * sub-hour precision (e.g. 5 = 5 min). Null when the plan relies on the legacy
   * validity_days (capped by time_limit) fallback.
   */
  duration_minutes?: number | null;
  /**
   * Effective access window in HOURS the customer ACTUALLY gets, computed by the
   * backend's single source of truth (`ServicePlan.access_window_hours()`).
   * <= 0 means no finite calendar window (e.g. unlimited time). The card renders
   * the validity from this so it always matches what is provisioned.
   */
  access_window_hours?: number;
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
  // Embedded TreasuryPaymentModal fields (in-app iframe checkout).
  intent_id?: string;
  initiate_url?: string;
  tenant_id?: string;
  amount?: number;
  currency?: string;
  reference_type?: string;
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
  /** Hotspot login credentials returned on success so the user can
   *  authenticate on the MikroTik login page if not auto-logged-in. */
  hotspot_username?: string;
  hotspot_password?: string;
  /** MikroTik hotspot gateway login URL (e.g. http://172.31.0.1/login) so the
   *  captive page can authenticate the client even on manual navigation, when
   *  there is no captive-redirect `loginurl` query param. */
  login_url?: string;
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

export interface ConnectionStatus {
  ready: boolean;
  status: string; // 'ready' | 'pending' | 'failed' | 'no_router'
  message?: string;
}

/**
 * Poll whether the hotspot user has actually been created on the router yet.
 * Gates auto-login after a redeem/payment so we never submit the MikroTik login
 * form before the agent's async create_user lands (NAT routers create users on
 * their next poll). Returns ready=true immediately for direct/VPN routers that
 * create the user synchronously (no queued command).
 */
export async function checkConnectionStatus(
  orgSlug: string,
  username: string,
): Promise<ConnectionStatus> {
  const response = await api.get<ConnectionStatus>(
    `/portal/hotspot/${orgSlug}/connection-status?username=${encodeURIComponent(username)}`,
  );
  const data = (response as { data?: ConnectionStatus })?.data;
  return data ?? (response as unknown as ConnectionStatus);
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

// Terminal payment states the poll must STOP on (besides success). The backend
// reports these on the `status` field; once seen there is nothing to wait for.
const TERMINAL_PAYMENT_STATES = ['failed', 'cancelled', 'canceled', 'expired', 'abandoned'];

// Bounded poll ceiling: 2s interval × 150 = ~5 minutes, matching the payment
// callback page's `maxAttempts`. Covers slow M-Pesa STK PIN entry + webhook,
// then stops so the UI can show a "taken too long" fallback instead of
// spinning forever.
const PAYMENT_POLL_INTERVAL_MS = 2000;
const PAYMENT_POLL_MAX_ATTEMPTS = 150;

/**
 * True once the payment poll has reached a terminal outcome: completed, a
 * terminal failure/cancel status, or the bounded max-attempt ceiling. The
 * "Waiting for Payment" UI uses this to STOP showing an infinite spinner.
 *
 * `attempts` MUST be the COMBINED count of successful + failed fetches
 * (`dataUpdateCount + errorUpdateCount`). On a captive device the status
 * endpoint may be unreachable, so the query only ever errors and
 * `dataUpdateCount` stays at 0 — counting errors too is what guarantees the
 * spinner is actually bounded in that case.
 */
export function isPaymentPollDone(status: PaymentStatus | undefined, attempts: number): boolean {
  if (status?.is_completed) return true;
  if (status?.status && TERMINAL_PAYMENT_STATES.includes(status.status.toLowerCase())) return true;
  return attempts >= PAYMENT_POLL_MAX_ATTEMPTS;
}

/** Combined success + error fetch count for a payment-status query. */
function paymentPollAttempts(query: {
  state: { dataUpdateCount: number; errorUpdateCount: number };
}): number {
  return query.state.dataUpdateCount + query.state.errorUpdateCount;
}

/**
 * Check payment status by reference.
 *
 * The poll is BOUNDED: it stops immediately on success (`is_completed`), on a
 * terminal failed/cancelled status, OR after ~5 minutes (PAYMENT_POLL_MAX_ATTEMPTS
 * fetches — success OR error). It never loops forever.
 *
 * Returns the React Query result plus a `pollDone` flag the UI uses to render a
 * terminal fallback (success / failed / "taken too long") instead of an infinite
 * spinner. `pollDone` is computed from the cumulative attempt count tracked here
 * (the observer result does NOT expose `dataUpdateCount`/`errorUpdateCount`),
 * which is why we count attempts in `queryFn` itself — covering the captive case
 * where the status endpoint is unreachable and every fetch errors.
 */
export function usePaymentStatus(orgSlug: string, reference?: string) {
  // Cumulative attempt count (success OR failure). Reset whenever the reference
  // changes so a brand-new purchase starts its poll window fresh.
  const attemptsRef = useRef(0);
  const lastRefRef = useRef<string | undefined>(reference);
  if (lastRefRef.current !== reference) {
    lastRefRef.current = reference;
    attemptsRef.current = 0;
  }

  const query = useQuery({
    queryKey: ['payment-status', orgSlug, reference],
    queryFn: async (): Promise<PaymentStatus> => {
      attemptsRef.current += 1;
      // Normalize responses from portal endpoints which sometimes return
      // either `{ success, data }` or a plain payload object.
      const resp = await api.get(`/portal/hotspot/${orgSlug}/payment/status`, {
        params: { reference },
      });
      const payload: PaymentStatus = (resp && (resp as any).data) ? (resp as any).data : (resp as any);
      return payload;
    },
    enabled: !!orgSlug && !!reference,
    // Don't let React Query's own retry/backoff stretch the bounded window or
    // mask the polling cadence — each interval tick is our single attempt.
    retry: false,
    refetchInterval: (q) => {
      const data = q.state.data;
      // STOP on a terminal success state.
      if (data?.is_completed) return false;
      // STOP on a terminal failed/cancelled/expired status — nothing left to wait for.
      if (data?.status && TERMINAL_PAYMENT_STATES.includes(data.status.toLowerCase())) return false;
      // STOP after the bounded ceiling so we never poll forever; the UI shows a
      // "taken too long / check again" fallback instead. Count BOTH successful
      // and failed fetches: on a captive device the status endpoint may be
      // unreachable, so only counting successes would let the spinner run
      // forever. This is the captive-safe bound.
      if (paymentPollAttempts(q) >= PAYMENT_POLL_MAX_ATTEMPTS) return false;
      // Otherwise keep the in-portal wait snappy (backend confirms ~instantly
      // via the NATS consumer with a synchronous treasury verify fallback).
      return PAYMENT_POLL_INTERVAL_MS;
    },
    // Keep polling even while the tab/page is backgrounded so a confirmation
    // that lands during the M-Pesa PIN entry is still picked up promptly.
    refetchIntervalInBackground: true,
  });

  const pollDone = isPaymentPollDone(query.data, attemptsRef.current);
  return { ...query, attempts: attemptsRef.current, pollDone };
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
