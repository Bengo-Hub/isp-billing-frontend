import { ReactNode } from 'react';

/**
 * Captive Portal Layout
 *
 * This is the PUBLIC buying page where MikroTik auto-redirects all users
 * connected to the ISP network (ethernet or WiFi hotspot).
 *
 * NO authentication required - this is the entry point for new customers
 * and returning customers to purchase packages.
 */
export default function CaptiveLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
