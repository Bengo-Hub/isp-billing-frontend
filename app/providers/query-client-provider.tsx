// app/providers/query-client-provider.tsx
'use client'

import { QueryClientProvider as Provider, QueryClient } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return <Provider client={queryClient}>{children}</Provider>
}
