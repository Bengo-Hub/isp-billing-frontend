'use client';

import { useSettings } from '@/features/settings/api';
import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────
interface BrandingContext {
  companyName: string;
  primaryColor: string;
  logoUrl: string | null;
  font: string;
  supportEmail: string;
  supportPhone: string;
}

const BrandingCtx = createContext<BrandingContext>({
  companyName: 'Codevertex Africa Limited',
  primaryColor: '#801066',
  logoUrl: null,
  font: 'Inter',
  supportEmail: '',
  supportPhone: '',
});

export const useBranding = () => useContext(BrandingCtx);

// ── Color utilities ────────────────────────────────────

/** Parse a hex color (#RRGGBB or #RGB) into [r, g, b] 0-255 */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Convert RGB (0-255) to HSL with h in degrees, s/l in percent */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** Generate the brand color scale CSS variables from a hex color */
function buildBrandCSSVars(hex: string): Record<string, string> {
  const [h, s, _l] = rgbToHsl(...hexToRgb(hex));

  // Use the hex's hue+saturation, but fix lightness for each stop to maintain
  // readable contrast across the scale (same pattern as the static globals.css).
  const sHigh = Math.min(s + 6, 100); // slightly more saturated for darker stops

  const vars: Record<string, string> = {};

  // ─ Primary token (light mode uses ~42% L, dark uses ~65% L) ─
  vars['--primary'] = `${h} ${s}% 42%`;
  vars['--ring'] = `${h} ${s}% 42%`;
  vars['--chart-1'] = `${h} ${s}% 42%`;

  // ─ Sidebar active states (light) ─
  vars['--sidebar-active'] = `${h} ${s}% 95%`;
  vars['--sidebar-active-foreground'] = `${h} ${sHigh}% 25%`;
  vars['--sidebar-active-border'] = `${h} ${s}% 42%`;

  // ─ Brand scale ─
  vars['--color-brand-50'] = `hsl(${h} ${s}% 97%)`;
  vars['--color-brand-100'] = `hsl(${h} ${s}% 93%)`;
  vars['--color-brand-200'] = `hsl(${h} ${s}% 85%)`;
  vars['--color-brand-300'] = `hsl(${h} ${s}% 72%)`;
  vars['--color-brand-400'] = `hsl(${h} ${s}% 58%)`;
  vars['--color-brand-500'] = `hsl(${h} ${s}% 45%)`;
  vars['--color-brand-600'] = `hsl(${h} ${s}% 38%)`;
  vars['--color-brand-700'] = `hsl(${h} ${sHigh}% 28%)`;
  vars['--color-brand-800'] = `hsl(${h} ${sHigh}% 22%)`;
  vars['--color-brand-900'] = `hsl(${h} ${sHigh}% 15%)`;
  vars['--color-brand-950'] = `hsl(${h} ${sHigh}% 10%)`;

  return vars;
}

/** Dark-mode overrides (lighter primary for contrast on dark backgrounds) */
function buildDarkOverrides(hex: string): Record<string, string> {
  const [h, s] = rgbToHsl(...hexToRgb(hex));
  return {
    '--primary': `${h} ${s}% 65%`,
    '--ring': `${h} ${s}% 65%`,
    '--chart-1': `${h} ${s}% 65%`,
    '--sidebar-active': `${h} ${s}% 15%`,
    '--sidebar-active-foreground': `${h} ${s}% 80%`,
    '--sidebar-active-border': `${h} ${s}% 55%`,
  };
}

// ── Provider ───────────────────────────────────────────

const DEFAULT_COLOR = '#801066';

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSettings('system');

  const primaryColor = (settings?.['system.primary_color'] as string) || DEFAULT_COLOR;

  // Compute CSS variable maps
  const { lightVars, darkVars } = useMemo(() => ({
    lightVars: buildBrandCSSVars(primaryColor),
    darkVars: buildDarkOverrides(primaryColor),
  }), [primaryColor]);

  // Apply variables to document root
  useLayoutEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    // Always apply brand scale + light-mode primary tokens
    for (const [prop, value] of Object.entries(lightVars)) {
      root.style.setProperty(prop, value);
    }

    // Layer dark overrides when dark mode is active
    if (isDark) {
      for (const [prop, value] of Object.entries(darkVars)) {
        root.style.setProperty(prop, value);
      }
    }

    // Listen for theme changes (ThemeProvider toggles .dark class)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          const nowDark = root.classList.contains('dark');
          // Re-apply light base
          for (const [prop, value] of Object.entries(lightVars)) {
            root.style.setProperty(prop, value);
          }
          if (nowDark) {
            for (const [prop, value] of Object.entries(darkVars)) {
              root.style.setProperty(prop, value);
            }
          }
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      // Clean up inline styles on unmount
      for (const prop of Object.keys(lightVars)) {
        root.style.removeProperty(prop);
      }
      for (const prop of Object.keys(darkVars)) {
        root.style.removeProperty(prop);
      }
    };
  }, [lightVars, darkVars]);

  const ctx = useMemo<BrandingContext>(() => ({
    companyName: (settings?.['system.company_name'] as string) || 'Codevertex Africa Limited',
    primaryColor,
    logoUrl: (settings?.['system.logo_url'] as string) || null,
    font: (settings?.['system.font'] as string) || 'Inter',
    supportEmail: (settings?.['system.support_email'] as string) || '',
    supportPhone: (settings?.['system.support_phone'] as string) || '',
  }), [settings, primaryColor]);

  return <BrandingCtx.Provider value={ctx}>{children}</BrandingCtx.Provider>;
}
