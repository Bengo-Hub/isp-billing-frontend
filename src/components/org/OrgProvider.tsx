'use client';

import { createContext, useContext, ReactNode } from 'react';

interface OrgContextValue {
  orgSlug: string;
}

const OrgContext = createContext<OrgContextValue | null>(null);

interface OrgProviderProps {
  children: ReactNode;
  orgSlug: string;
}

/**
 * Organization context provider
 * Provides the current organization slug to all child components
 * This enables tenant-specific API calls and UI customization
 */
export function OrgProvider({ children, orgSlug }: OrgProviderProps) {
  return (
    <OrgContext.Provider value={{ orgSlug }}>
      {children}
    </OrgContext.Provider>
  );
}

/**
 * Hook to access the current organization slug
 * @throws Error if used outside OrgProvider
 */
export function useOrg(): OrgContextValue {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }

  return context;
}
