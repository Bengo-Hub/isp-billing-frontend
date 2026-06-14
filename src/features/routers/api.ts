import { api } from '@/lib/api';
import { queryKeys, QUERY_STALE_TIMES, QUERY_GC_TIMES } from '@/lib/query/query-client';
import { getDevFallback } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type RouterItem = {
  id: number;
  name: string;
  ip_address: string;
  status: string;
  router_type: string;
  uptime: number;
  winbox_port?: number;
  provisioning_status?: string;
  bootstrap_completed?: boolean;
  // System resource fields
  routeros_version?: string;
  board_name?: string;
  architecture?: string;
  cpu_count?: number;
  cpu_frequency?: number;
  cpu_load?: number;
  total_memory?: number;
  free_memory?: number;
  total_hdd_space?: number;
  free_hdd_space?: number;
  // MikroTik-formatted display values
  uptime_formatted?: string;
  cpu_frequency_formatted?: string;
  cpu_load_formatted?: string;
  total_memory_formatted?: string;
  free_memory_formatted?: string;
  total_hdd_space_formatted?: string;
  free_hdd_space_formatted?: string;
  // Polling agent fields
  agent_installed?: boolean;
  agent_poll_interval?: number;
  last_poll_at?: string;
  last_seen?: string;
  agent_version?: string;
};

// Agent status response type
export interface RouterAgentStatus {
  router_id: number;
  agent_installed: boolean;
  agent_version?: string;
  last_poll_at?: string;
  poll_interval: number;
  is_online: boolean;
  seconds_since_last_poll?: number;
  pending_commands: number;
  recent_commands: Array<{
    id: string;
    action: string;
    status: string;
    created_at: string;
  }>;
}

// Fallback data for development/demo only
const routerFallback: { items: RouterItem[] } = {
  items: [
    { id: 1, name: 'HQ Router', ip_address: '192.168.1.1', status: 'online', router_type: 'mikrotik', uptime: 86400 },
    { id: 3, name: 'Branch B', ip_address: '172.16.0.1', status: 'offline', router_type: 'mikrotik', uptime: 0 },
  ],
};

export function useRouters() {
  return useQuery({
    queryKey: queryKeys.routers.all,
    queryFn: async (): Promise<{ items: RouterItem[] }> => {
      try {
        const { data } = await api.get('/routers/');
        return data;
      } catch {
        // Only return fallback in development, throw in production
        return getDevFallback(routerFallback);
      }
    },
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

// Router detail type
export interface RouterDetail {
  id: number;
  name: string;
  description?: string;
  router_type: string;
  ip_address: string;
  port: number;
  username?: string;
  password?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  notes?: string;
  status: string;
  is_active: boolean;
  uptime: number;
  last_seen?: string;
  config?: string;
  provisioning_status?: string;
  bootstrap_completed?: boolean;
  // Polling agent fields
  agent_installed?: boolean;
  agent_poll_interval?: number;
  last_poll_at?: string;
  agent_version?: string;
  created_at: string;
  updated_at: string;
  devices: Array<{
    id: number;
    router_id: number;
    name: string;
    device_type?: string;
    mac_address?: string;
    ip_address?: string;
    status: string;
  }>;
}

// System resources from MikroTik
export interface RouterSystemResources {
  cpu_load: number;
  free_memory: number;
  total_memory: number;
  free_hdd_space: number;
  total_hdd_space: number;
  uptime: string;
  version: string;
  board_name: string;
  platform: string;
  architecture_name: string;
}

// Fetch single router details
export function useRouter(routerId: number) {
  return useQuery({
    queryKey: queryKeys.routers.detail(String(routerId)),
    queryFn: async (): Promise<RouterDetail> => {
      const { data } = await api.get(`/routers/${routerId}`);
      return data;
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

// Fetch router system resources from MikroTik
export function useRouterSystemResources(routerId: number) {
  return useQuery({
    queryKey: queryKeys.routers.status(String(routerId)),
    queryFn: async (): Promise<RouterSystemResources | null> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/resources`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Test router connection
export function useTestRouterConnection() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const { data } = await api.post(`/routers/${routerId}/test`);
      return data as { success: boolean; online: boolean; mode: string; message: string };
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Router is reachable');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Router is not reachable');
    },
  });
}

export function useActiveConnections(routerId: number) {
  return useQuery({
    queryKey: queryKeys.routers.devices(String(routerId)),
    queryFn: async (): Promise<any[]> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/active-connections`);
        return data ?? [];
      } catch {
        // NAT-safe endpoint returns an empty list when there is no live data;
        // never fall back to mock users.
        return [];
      }
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 30000,
  });
}

export function useDisconnectUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ routerId, username, userType }: { routerId: number; username: string; userType: 'hotspot' | 'pppoe' }) => {
      const { data } = await api.post(`/routers/${routerId}/disconnect-user`, null, {
        params: { username, user_type: userType },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.routers.devices(String(variables.routerId)) });
    },
  });
}

// Provisioning API hooks
export function useStartProvisioning() {
  return useMutation({
    mutationFn: async (payload: {
      router_id: number;
      service_type: 'hotspot' | 'pppoe_server' | 'both';
      configuration: Record<string, any>;
      auto_start?: boolean;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }) => {
      const { data } = await api.post('/provisioning/workflow', {
        router_id: payload.router_id,
        service_type: payload.service_type,
        configuration: payload.configuration,
        auto_start: payload.auto_start ?? true,
        priority: payload.priority ?? 'normal',
      });
      return data as { session_id: string };
    },
  });
}

export function useProvisioningStatus(sessionId?: string) {
  return useQuery({
    queryKey: ['provisioning', 'status', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/provisioning/sessions/${sessionId}/status`);
      return data as {
        status: string;
        progress_percentage: number;
        current_step: string;
        current_operation?: string;
        error_message?: string;
      };
    },
    enabled: !!sessionId,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 3000,
  });
}

// Device scanning API
export function useScanDevice() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const { data } = await api.post('/provisioning/device/scan', { router_id: routerId });
      return data as {
        interfaces: string[];
        services: string[];
        current_subnet: string;
        available_services: string[];
        system_info: Record<string, any>;
      };
    },
  });
}

// Router CRUD operations
// Note: Credentials are NOT sent from frontend - they are pulled from
// environment variables (MIKROTIK_API_USERNAME, MIKROTIK_API_PASSWORD) on the backend.
export interface RouterCreateData {
  name: string;
  ip_address: string;
  api_port?: number;
  router_type?: 'mikrotik';
  description?: string;
}

export function useCreateRouter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RouterCreateData) => {
      const response = await api.post('/routers/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routers.all });
      toast.success('Router created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create router');
    },
  });
}

// Upsert router - creates new or updates existing by IP address
// Used during provisioning flow to avoid creating duplicate routers
export function useUpsertRouter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RouterCreateData) => {
      const response = await api.post('/routers/upsert', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routers.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save router');
    },
  });
}

export function useUpdateRouter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routerId, data }: { routerId: number; data: Partial<RouterCreateData> }) => {
      const response = await api.patch(`/routers/${routerId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routers.all });
      toast.success('Router updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update router');
    },
  });
}

export function useDeleteRouter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: number) => {
      await api.delete(`/routers/${routerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routers.all });
      toast.success('Router deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete router');
    },
  });
}

export function useRebootRouter() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/reboot`);
      return response.data as { success: boolean; queued?: boolean; message: string };
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Router reboot initiated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reboot router');
    },
  });
}

// Enroll a router into the WireGuard VPN overlay (NAT-safe; queues an agent
// action-script). Lets an already-bootstrapped router join the tunnel and enables
// remote winbox at vpn:<winbox_port> WITHOUT a manual re-bootstrap.
export function useEnrollRouterVpn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/enroll-vpn`);
      return response.data as { message: string; command_id?: string; winbox_port?: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast.success(data?.message || 'VPN enrollment queued');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to enroll router in VPN');
    },
  });
}

// Backup history row (NAT-safe: backups run on the router via the agent).
export interface RouterBackup {
  id: number;
  name: string;
  status: 'pending' | 'completed' | 'failed';
  backup_type: string;
  size_bytes?: number | null;
  message?: string | null;
  created_at?: string;
  completed_at?: string | null;
}

// Create a backup — NAT-safe: queues an agent action that runs
// /system/backup/save locally and records a history row. Returns JSON (no blob).
export function useCreateRouterBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/backup`);
      return response.data as {
        success: boolean;
        queued: boolean;
        backup_id: number;
        name: string;
        status: string;
        message: string;
      };
    },
    onSuccess: (data, routerId) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.routers.detail(String(routerId)), 'backups'],
      });
      toast.success(data?.message || 'Backup queued to the router agent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create backup');
    },
  });
}

export function useRestoreRouterBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routerId, file }: { routerId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/routers/${routerId}/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routers.all });
      toast.success('Router configuration restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to restore backup');
    },
  });
}

export function useListRouterBackups(routerId: number) {
  return useQuery({
    queryKey: [...queryKeys.routers.detail(String(routerId)), 'backups'],
    queryFn: async (): Promise<RouterBackup[]> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/backups`);
        return data ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 30000,
  });
}

// Device events timeline (RouterLog + agent command history) — NAT-safe.
// Shape mirrors GET /routers/{id}/events which merges RouterLog + RouterCommand
// rows server-side. The backend collapses `source`/`result_message` into
// `details` and does not expose params/sent_at/completed_at separately.
export interface RouterEvent {
  id: string;
  kind: 'log' | 'command';
  action: string;
  details?: string;
  success: boolean;
  status: string;
  created_at?: string;
}

/**
 * Device events for a router.
 *
 * The backend endpoint returns a single newest-first list (capped by `limit`,
 * max 500) and does NOT support page/size params, so pagination is done
 * client-side by the Device Events tab. We pull a generous window here so the
 * client pager has enough rows to page through without re-fetching.
 */
export function useRouterEvents(routerId: number, limit = 200) {
  return useQuery({
    queryKey: [...queryKeys.routers.detail(String(routerId)), 'events', limit],
    queryFn: async (): Promise<RouterEvent[]> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/events`, {
          params: { limit },
        });
        return data ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 30000,
  });
}

// Payments for subscriptions on this router — NAT-safe (DB-only).
export interface RouterPayment {
  id: number;
  payment_number: string;
  amount: number;
  currency: string;
  payment_method?: string | null;
  status?: string | null;
  payment_date?: string | null;
  created_at?: string;
  invoice_number: string;
  subscription_id: number;
  subscription_username: string;
  customer?: string | null;
}

export function useRouterPayments(routerId: number) {
  return useQuery({
    queryKey: [...queryKeys.routers.detail(String(routerId)), 'payments'],
    queryFn: async (): Promise<RouterPayment[]> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/payments`);
        return data ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

export function useDownloadRouterBackup() {
  return useMutation({
    mutationFn: async ({ routerId, backupId }: { routerId: number; backupId: number }) => {
      const response = await api.get(`/routers/${routerId}/backups/${backupId}/download`, {
        responseType: 'blob',
      });

      const filename = `router_${routerId}_backup_${backupId}.backup`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
    onSuccess: () => {
      toast.success('Backup downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to download backup');
    },
  });
}

// Router sync operations
export function useSyncRouter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/sync`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routers.all });
      toast.success('Router synced successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to sync router');
    },
  });
}

export function useSyncRouterTime() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/sync-time`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Router time synchronized');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to sync router time');
    },
  });
}

export function useSyncHotspotFiles() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/sync-hotspot-files`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Hotspot files synchronized');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to sync hotspot files');
    },
  });
}

export function useRegenerateWinbox() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/regenerate-winbox`);
      return response.data as {
        success: boolean;
        message: string;
        router_id: number;
        username: string;
        new_password: string;
        winbox_url: string;
        local_winbox_url: string;
        remote_winbox_url?: string;
        winbox_port?: number;
        api_port: number;
        note: string;
      };
    },
    onSuccess: () => {
      toast.success('Winbox credentials regenerated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to regenerate Winbox credentials');
    },
  });
}

// Winbox URL response type
export interface WinboxUrlResponse {
  router_id: number;
  router_name: string;
  winbox_port: number | null;
  winbox_url: string | null;
  local_winbox_url: string;
  vpn_domain: string;
  is_configured: boolean;
  tooltip: string;
}

// Fetch Winbox URL for a router
export function useWinboxUrl(routerId: number) {
  return useQuery({
    queryKey: ['winbox-url', routerId],
    queryFn: async (): Promise<WinboxUrlResponse> => {
      const { data } = await api.get(`/routers/${routerId}/winbox-url`);
      return data;
    },
    enabled: !!routerId,
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

// Active connection type from MikroTik
export interface ActiveConnection {
  id?: string;
  user?: string;
  name?: string;
  address: string;
  'mac-address'?: string;
  uptime?: string;
  'session-time-left'?: string;
  'bytes-in'?: string;
  'bytes-out'?: string;
  server?: string;
  type: 'hotspot' | 'pppoe';
  router_id: number;
  router_name: string;
}

// Fetch all active connections across all routers (or a specific router)
export function useAllActiveConnections(routerId?: number | null) {
  const { data: routersData, isLoading: routersLoading } = useRouters();

  return useQuery({
    queryKey: ['active-sessions', 'all', routerId, routersData?.items?.map(r => r.id)],
    queryFn: async (): Promise<ActiveConnection[]> => {
      if (!routersData?.items || routersData.items.length === 0) {
        return [];
      }

      // Filter to specific router if routerId provided
      let onlineRouters = routersData.items.filter(r => r.status === 'online');
      if (routerId) {
        onlineRouters = onlineRouters.filter(r => r.id === routerId);
      }

      const connectionPromises = onlineRouters.map(async (router) => {
        try {
          const { data } = await api.get(`/routers/${router.id}/active-connections`);
          return (data || []).map((conn: any) => ({
            ...conn,
            router_id: router.id,
            router_name: router.name,
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(connectionPromises);
      return results.flat();
    },
    enabled: !routersLoading && !!routersData?.items && routersData.items.length > 0,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Fetch agent status for a specific router (pending commands, poll info)
export function useRouterAgentStatus(routerId: number, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.routers.detail(String(routerId)), 'agent-status'],
    queryFn: async (): Promise<RouterAgentStatus | null> => {
      try {
        const { data } = await api.get(`/router-agent/status/${routerId}`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!routerId && enabled,
    staleTime: QUERY_STALE_TIMES.REALTIME,
    gcTime: QUERY_GC_TIMES.REALTIME,
    refetchInterval: 30000,
  });
}
