'use client';

import { useRouters } from '@/features/routers/api';
import { Router } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RouterFilterProps {
  value: number | null;
  onChange: (routerId: number | null) => void;
  className?: string;
}

/**
 * Reusable router filter dropdown component
 * Fetches routers using TanStack Query with 5min cache
 */
export function RouterFilter({ value, onChange, className = '' }: RouterFilterProps) {
  const { data, isLoading } = useRouters();
  const routers = data?.items ?? [];

  if (isLoading) {
    return <Skeleton className="h-10 w-48" />;
  }

  // Don't show filter if only one router
  if (routers.length <= 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Router className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="pl-9 pr-3 py-2 border rounded-md text-sm bg-background text-foreground border-border hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer min-w-[12rem]"
      >
        <option value="">All Routers</option>
        {routers.map((router) => (
          <option key={router.id} value={router.id}>
            {router.name} ({router.status})
          </option>
        ))}
      </select>
    </div>
  );
}
