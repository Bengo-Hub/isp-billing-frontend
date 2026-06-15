/**
 * Application configuration with environment variable support and fallbacks
 */

export const config = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Codevertex ISP Billing',

  /**
   * WebSocket base URL (no path). The WS endpoint lives on the SAME host as the
   * REST API, so we derive it from the API URL by default: this guarantees
   * `wss://` on HTTPS pages and the correct host, avoiding the old
   * `ws://localhost:8000` fallback that threw a mixed-content SecurityError in
   * production (leaving `readyState` undefined). An explicit, non-localhost
   * NEXT_PUBLIC_WS_BASE_URL still wins if provided.
   */
  get wsUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL;
    if (explicit && !explicit.includes('localhost')) return explicit;

    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    try {
      const u = new URL(api);
      const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${u.host}`;
    } catch {
      return explicit || 'ws://localhost:8000';
    }
  },

  /**
   * Sibling-service UI base URLs (data-ownership link-outs).
   *
   * Per CROSS-SERVICE-DATA-OWNERSHIP.md, isp-billing does NOT own tenants/users
   * (auth-api), subscription plans/tiers (subscriptions-api) or invoices/payments
   * (treasury-api). Where a sibling already has a first-class management UI, the
   * platform screens here LINK OUT to it instead of driving parallel writes.
   * These are optional: when unset, the platform pages still render their local
   * read-only summary and simply omit the "Manage in <service>" button.
   */
  accountsUiUrl: process.env.NEXT_PUBLIC_ACCOUNTS_UI_URL || '',      // auth-api UI (tenants/users)
  subscriptionsUiUrl: process.env.NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL || '', // subscriptions-api UI (plans/tiers)
  treasuryUiUrl: process.env.NEXT_PUBLIC_TREASURY_UI_URL || '',      // treasury-api UI (invoices/payments)

  // MikroTik Router Configuration
  // Default router IP for provisioning, ping checks, and form defaults
  defaultRouterIp: process.env.NEXT_PUBLIC_DEFAULT_ROUTER_IP || '192.168.88.1',
  // Default subnet for provisioning configuration
  defaultSubnet: process.env.NEXT_PUBLIC_DEFAULT_SUBNET || '192.168.88.0/24',

  // Derived values
  get defaultSubnetBase() {
    // Extract base from subnet (e.g., "192.168.88" from "192.168.88.0/24")
    return this.defaultSubnet.split('/')[0].split('.').slice(0, 3).join('.');
  },
} as const;

export type Config = typeof config;
