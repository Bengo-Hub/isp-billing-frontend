'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PublicBrandedLayoutProps {
  children: ReactNode;
  orgSlug?: string;
  showHeader?: boolean;
  backgroundColor?: string;
}

interface OrganizationConfig {
  organization_name: string;
  logo_url?: string;
  primary_color?: string;
  portal_title?: string;
  portal_description?: string;
}

// Hook to fetch organization config for branding
function useOrganizationConfig(orgSlug?: string) {
  return useQuery({
    queryKey: ['org-config', orgSlug],
    queryFn: async (): Promise<OrganizationConfig> => {
      if (!orgSlug) {
        // Return default config if no org slug provided
        return {
          organization_name: 'ISP Billing',
          primary_color: '#ec4899',
        };
      }
      const { data } = await api.get(`/portal/${orgSlug}/config`);
      return data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Public Branded Layout Component
 *
 * Provides consistent branding for public-facing pages like payment callbacks and captive portals.
 * Can optionally display organization logo and branding.
 */
export function PublicBrandedLayout({
  children,
  orgSlug,
  showHeader = false,
  backgroundColor,
}: PublicBrandedLayoutProps) {
  const { data: config, isLoading } = useOrganizationConfig(orgSlug);

  const primaryColor = config?.primary_color || backgroundColor || '#ec4899';
  const bgColor = `${primaryColor}10`;

  if (isLoading && orgSlug) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {showHeader && config && (
        <header
          className="py-6 px-4 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            {config.logo_url && (
              <img
                src={config.logo_url}
                alt={config.organization_name}
                className="h-12 object-contain"
              />
            )}
            {!config.logo_url && (
              <h1 className="text-2xl font-bold text-white">
                {config.organization_name}
              </h1>
            )}
          </div>
        </header>
      )}

      <main className="relative">{children}</main>

      {config && (
        <footer className="py-6 text-center border-t bg-white/50">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} {config.organization_name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by{' '}
            <span className="font-medium" style={{ color: primaryColor }}>
              ISP Billing Platform
            </span>
          </p>
        </footer>
      )}
    </div>
  );
}

export default PublicBrandedLayout;
