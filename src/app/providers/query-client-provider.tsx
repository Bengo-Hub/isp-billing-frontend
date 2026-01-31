// app/providers/query-client-provider.tsx
'use client'

import { QueryClientProvider as Provider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { getQueryClient } from '@/lib/query/query-client'

export function QueryClientProvider({ children }: { children: ReactNode }) {
  // Use the centralized query client with proper defaults
  const [queryClient] = useState(() => getQueryClient())

  return <Provider client={queryClient}>{children}</Provider>
}
