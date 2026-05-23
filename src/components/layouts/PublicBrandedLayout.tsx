'use client';

import { brandBg, usePortalBranding } from '@/hooks/use-portal-branding';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface PublicBrandedLayoutProps {
  children: ReactNode;
  orgSlug?: string;
  showHeader?: boolean;
  backgroundColor?: string;
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
  const { branding, primaryColor, isLoading } = usePortalBranding(orgSlug);

  const bgColor = backgroundColor || brandBg(primaryColor, 0.06);

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
      {showHeader && (
        <header
          className="py-6 px-4 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            {branding.logoUrl && (
              <img
                src={branding.logoUrl}
                alt={branding.organizationName}
                className="h-12 object-contain"
              />
            )}
            {!branding.logoUrl && (
              <h1 className="text-2xl font-bold text-white">
                {branding.organizationName}
              </h1>
            )}
          </div>
        </header>
      )}

      <main className="relative">{children}</main>

      <footer className="py-6 text-center border-t bg-white/50">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} {branding.organizationName}. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Powered by{' '}
          <span className="font-medium" style={{ color: primaryColor }}>
            Codevertex Africa Limited
          </span>
        </p>
      </footer>
    </div>
  );
}

export default PublicBrandedLayout;
