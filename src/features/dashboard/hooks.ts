import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export interface SystemLogEntry {
  id: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  action?: string;
  entity_type?: string;
  entity_id?: number;
  user_email?: string;
  timestamp?: string;
  created_at?: string;
}

interface SystemLogsResponse {
  logs: SystemLogEntry[];
  total: number;
  page: number;
  size: number;
}

/**
 * Fetch recent system activity logs for the dashboard widget.
 * Uses the GET /support/system endpoint with a small page size.
 */
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async (): Promise<SystemLogEntry[]> => {
      const { data } = await api.get<SystemLogsResponse>('/support/system', {
        params: { page: 1, size: limit },
      });
      return data.logs ?? [];
    },
    refetchInterval: 60000, // Refresh every 60 seconds
  });
}
