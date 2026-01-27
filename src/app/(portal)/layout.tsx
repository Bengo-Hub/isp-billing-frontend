import { ReactNode } from 'react';

export default function PortalLayout({ children }: { children: ReactNode }) {
  // Portal pages are public - no auth required
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
