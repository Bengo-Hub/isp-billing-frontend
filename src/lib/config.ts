/**
 * Application configuration with environment variable support and fallbacks
 */

export const config = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Codevertex ISP Billing',

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
