'use client';

import { ReactNode, useEffect } from 'react';

/**
 * Captive Portal Layout
 *
 * This is the PUBLIC buying page where MikroTik auto-redirects all users
 * connected to the ISP network (ethernet or WiFi hotspot).
 *
 * NO authentication required - this is the entry point for new customers
 * and returning customers to purchase packages.
 *
 * THEME: the captive portal is ALWAYS light + brand-coloured. The global
 * ThemeProvider defaults to `system`, so on a device set to dark mode it adds
 * `.dark` to <html>, which dragged the portal's cards and (portaled) modals
 * dark + off-brand. We force light here with a MutationObserver — a one-shot
 * removal would lose the race (child effects run before the parent provider's
 * effect, which re-adds `.dark`). The observer reverts any `.dark` applied while
 * on this route, and restores the user's real theme on leaving so the
 * admin/dashboard routes are unaffected.
 */
export default function CaptiveLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;

    const forceLight = () => {
      if (root.classList.contains('dark')) root.classList.remove('dark');
      if (!root.classList.contains('light')) root.classList.add('light');
      root.style.colorScheme = 'light';
    };

    forceLight();
    const obs = new MutationObserver(forceLight);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      obs.disconnect();
      root.style.colorScheme = '';
      // Restore the user's real theme for non-captive routes (SPA nav away).
      try {
        const stored = localStorage.getItem('codevertex-theme') || 'system';
        const sys = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(stored === 'system' ? sys : stored);
      } catch {
        /* no-op */
      }
    };
  }, []);

  return <>{children}</>;
}
