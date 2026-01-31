'use client';

import { PortalConfig } from '@/features/portal/api';
import { Wifi } from 'lucide-react';

// Default Codevertex branding (uses same logo as Brand.tsx)
export const DEFAULT_BRANDING = {
  organization_name: 'CodeVertex IT Solutions',
  logo_url: '/images/logo/logo.png',
  primary_color: '#ec4899',
  portal_title: 'WiFi Hotspot',
  portal_description: 'Fast, reliable internet access',
};

interface PortalBrandingProps {
  config?: PortalConfig | null;
  variant?: 'header' | 'compact' | 'full';
  className?: string;
}

export function PortalBranding({ config, variant = 'header', className = '' }: PortalBrandingProps) {
  const branding = {
    organization_name: config?.organization_name || DEFAULT_BRANDING.organization_name,
    logo_url: config?.logo_url || DEFAULT_BRANDING.logo_url,
    primary_color: config?.primary_color || DEFAULT_BRANDING.primary_color,
    portal_title: config?.portal_title || config?.organization_name || DEFAULT_BRANDING.portal_title,
    portal_description: config?.portal_description || DEFAULT_BRANDING.portal_description,
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {branding.logo_url ? (
          <img
            src={branding.logo_url}
            alt={branding.organization_name}
            className="h-8 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${branding.primary_color}20` }}
          >
            <Wifi className="w-5 h-5" style={{ color: branding.primary_color }} />
          </div>
        )}
        <span className="font-semibold text-gray-900">{branding.organization_name}</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`text-center ${className}`}>
        {branding.logo_url ? (
          <img
            src={branding.logo_url}
            alt={branding.organization_name}
            className="h-20 w-auto mx-auto mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${branding.primary_color}20` }}
          >
            <Wifi className="w-10 h-10" style={{ color: branding.primary_color }} />
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{branding.portal_title}</h1>
        <p className="text-gray-600">{branding.portal_description}</p>
      </div>
    );
  }

  // Default header variant
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {branding.logo_url ? (
        <img
          src={branding.logo_url}
          alt={branding.organization_name}
          className="h-12 w-auto"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${branding.primary_color}20` }}
        >
          <Wifi className="w-6 h-6" style={{ color: branding.primary_color }} />
        </div>
      )}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{branding.portal_title}</h1>
        <p className="text-sm text-gray-600">{branding.portal_description}</p>
      </div>
    </div>
  );
}

interface PortalHeaderProps {
  config?: PortalConfig | null;
  showBanner?: boolean;
  bannerText?: string;
  bannerLink?: string;
}

export function PortalHeader({ config, showBanner, bannerText, bannerLink }: PortalHeaderProps) {
  const primaryColor = config?.primary_color || DEFAULT_BRANDING.primary_color;
  const logoUrl = config?.logo_url || DEFAULT_BRANDING.logo_url;
  const orgName = config?.organization_name || DEFAULT_BRANDING.organization_name;
  const portalTitle = config?.portal_title || config?.organization_name || DEFAULT_BRANDING.portal_title;
  const portalDescription = config?.portal_description || DEFAULT_BRANDING.portal_description;

  return (
    <header className="bg-white border-b shadow-sm">
      {/* Promotional Banner */}
      {showBanner && bannerText && (
        <div
          className="py-2 px-4 text-center text-white text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          {bannerLink ? (
            <a href={bannerLink} className="hover:underline">
              {bannerText}
            </a>
          ) : (
            bannerText
          )}
        </div>
      )}

      {/* Main Header with Logo */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Logo */}
          {logoUrl && (
            <img
              src={logoUrl}
              alt={orgName}
              className="h-14 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {/* Title and Description */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{portalTitle}</h1>
            <p className="text-sm text-gray-500">{portalDescription}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

interface PortalFooterProps {
  config?: PortalConfig | null;
  showPoweredBy?: boolean;
}

export function PortalFooter({ config, showPoweredBy = true }: PortalFooterProps) {
  const primaryColor = config?.primary_color || DEFAULT_BRANDING.primary_color;
  const orgName = config?.organization_name || DEFAULT_BRANDING.organization_name;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Support Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a
                href={`mailto:support@${orgName.toLowerCase().replace(/\s+/g, '')}.com`}
                className="hover:underline transition-colors"
                style={{ color: primaryColor }}
              >
                support@{orgName.toLowerCase().replace(/\s+/g, '')}.com
              </a>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-500">Need help? We&apos;re here 24/7</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:text-gray-700 transition-colors">FAQ</a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-4 sm:mt-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Copyright */}
            <p className="text-xs text-gray-400 text-center sm:text-left">
              © {currentYear} {orgName}. All rights reserved.
            </p>

            {/* Powered By */}
            {showPoweredBy && (
              <a
                href="https://codevertex.co.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors group"
              >
                <span>Powered by</span>
                <img
                  src="/images/logo/logo.png"
                  alt="Codevertex"
                  className="h-5 w-auto opacity-60 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const span = document.createElement('span');
                      span.className = 'font-medium';
                      span.textContent = 'Codevertex';
                      parent.appendChild(span);
                    }
                  }}
                />
              </a>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-50">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] sm:text-xs text-gray-400">Secure payments powered by industry-standard encryption</span>
        </div>
      </div>
    </footer>
  );
}

export function getPortalColors(config?: PortalConfig | null) {
  const primaryColor = config?.primary_color || DEFAULT_BRANDING.primary_color;

  return {
    primary: primaryColor,
    primaryLight: `${primaryColor}10`,
    primaryMedium: `${primaryColor}20`,
    primaryDark: `${primaryColor}90`,
  };
}
