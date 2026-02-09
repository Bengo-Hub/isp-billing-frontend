import { ReactNode } from 'react';

interface OrgLayoutProps {
  children: ReactNode;
  params: Promise<{ org: string }>;
}

/**
 * Root layout for organization-specific routes
 * This layout provides the org slug context to all child routes
 * Structure: /[org]/dashboard, /[org]/portal/hotspot, /[org]/portal/pppoe
 */
export default async function OrgLayout({ children }: OrgLayoutProps) {
  // The org slug is available via params
  // Child layouts and pages can access it through their own params
  // This layout just passes children through

  return <>{children}</>;
}