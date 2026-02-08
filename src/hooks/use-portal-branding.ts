/**
 * Centralized portal branding hook.
 *
 * Provides a single source of truth for org branding across captive portal,
 * public pages, and customer portal layouts. Falls back to Codevertex
 * defaults when the org has no branding configured.
 *
 * Usage:
 *   const { branding, primaryColor, isLoading } = usePortalBranding(orgSlug);
 */

'use client';

import { usePortalConfig, type PortalConfig } from '@/features/portal/api';

// ─── Defaults (Codevertex) ──────────────────────────────────────────────────

export const DEFAULT_BRANDING = {
  organization_name: 'CodeVertex IT Solutions',
  logo_url: '/images/logo/logo.png',
  primary_color: '#801066',
  portal_title: 'WiFi Hotspot',
  portal_description: 'Fast, reliable internet access',
  show_packages: true,
  allow_guest_purchases: true,
} as const satisfies PortalConfig;

// ─── Derived branding type ──────────────────────────────────────────────────

export interface ResolvedBranding {
  organizationName: string;
  logoUrl: string;
  primaryColor: string;
  portalTitle: string;
  portalDescription: string;
  showPackages: boolean;
  allowGuestPurchases: boolean;
}

// ─── Color helpers ──────────────────────────────────────────────────────────

/** Return tinted background for hero / accent areas. */
export function brandBg(color: string, opacity = 0.08) {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

/** Return an inline-style object for a primary-colored button. */
export function brandButton(color: string): React.CSSProperties {
  return { backgroundColor: color };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePortalBranding(orgSlug: string | undefined) {
  const { data: config, isLoading, error } = usePortalConfig(orgSlug ?? '');

  const branding: ResolvedBranding = {
    organizationName: config?.organization_name || DEFAULT_BRANDING.organization_name,
    logoUrl: config?.logo_url || DEFAULT_BRANDING.logo_url,
    primaryColor: config?.primary_color || DEFAULT_BRANDING.primary_color,
    portalTitle:
      config?.portal_title ||
      config?.organization_name ||
      DEFAULT_BRANDING.portal_title,
    portalDescription:
      config?.portal_description || DEFAULT_BRANDING.portal_description,
    showPackages: config?.show_packages ?? DEFAULT_BRANDING.show_packages,
    allowGuestPurchases:
      config?.allow_guest_purchases ?? DEFAULT_BRANDING.allow_guest_purchases,
  };

  return {
    /** Resolved branding with fallback to Codevertex defaults. */
    branding,
    /** Shorthand for branding.primaryColor. */
    primaryColor: branding.primaryColor,
    /** Raw portal config from the API (may be undefined). */
    config,
    /** True while the config fetch is in-flight. */
    isLoading,
    /** Fetch error, if any. */
    error,
  } as const;
}
