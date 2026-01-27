'use client';

import { useEffect, useState } from 'react';

/**
 * AuthProvider ensures the auth store has completed hydration
 * before rendering children. This prevents flash of incorrect auth state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait for client-side mount to complete
    // This ensures localStorage is available and initial hydration happens
    setMounted(true);
  }, []);

  // Show loading until client-side mount completes
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
