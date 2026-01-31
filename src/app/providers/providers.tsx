'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { getQueryClient } from '@/lib/query/query-client';

export function Providers({ children }: { children: ReactNode }) {
  // Use the centralized query client with proper defaults
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

