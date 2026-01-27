import { api } from '@/lib/api';
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
};

// Fallback data for development/demo only
const routerFallback: { items: RouterItem[] } = {
  items: [
    { id: 1, name: 'HQ Router', ip_address: '192.168.1.1', status: 'online', router_type: 'mikrotik', uptime: 86400 },
    { id: 3, name: 'Branch B', ip_address: '172.16.0.1', status: 'offline', router_type: 'mikrotik', uptime: 0 },
  ],
};

const activeFallback = [
  { type: 'hotspot', name: 'alice', address: '192.168.88.10', 'mac-address': 'AA:BB:CC:DD:EE:01' },
  { type: 'pppoe', user: 'ppp-user-1', address: '10.10.0.2', 'caller-id': '0700000000' },
];

export function useRouters() {
  return useQuery({
    queryKey: ['routers'],
    queryFn: async (): Promise<{ items: RouterItem[] }> => {
      try {
        const { data } = await api.get('/routers/');
        return data;
      } catch {
        // Only return fallback in development, throw in production
        return getDevFallback(routerFallback);
      }
    },
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
  username: string;
  password: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  notes?: string;
  status: string;
  is_active: boolean;
  uptime: number;
  last_seen?: string;
  config?: string;
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
    queryKey: ['router', routerId],
    queryFn: async (): Promise<RouterDetail> => {
      const { data } = await api.get(`/routers/${routerId}`);
      return data;
    },
    enabled: !!routerId,
  });
}

// Fetch router system resources from MikroTik
export function useRouterSystemResources(routerId: number) {
  return useQuery({
    queryKey: ['router-resources', routerId],
    queryFn: async (): Promise<RouterSystemResources | null> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/resources`);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!routerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Test router connection
export function useTestRouterConnection() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const { data } = await api.post(`/routers/${routerId}/test`);
      return data;
    },
    onSuccess: () => {
      toast.success('Router connection successful');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to connect to router');
    },
  });
}

export function useActiveConnections(routerId: number) {
  return useQuery({
    queryKey: ['router-active', routerId],
    queryFn: async (): Promise<any[]> => {
      try {
        const { data } = await api.get(`/routers/${routerId}/active-connections`);
        return data;
      } catch {
        return activeFallback;
      }
    },
    enabled: !!routerId,
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
      qc.invalidateQueries({ queryKey: ['router-active', variables.routerId] });
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
    queryKey: ['provisioning-status', sessionId],
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
export interface RouterCreateData {
  name: string;
  ip_address: string;
  username: string;
  password: string;
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
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast.success('Router created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create router');
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
      queryClient.invalidateQueries({ queryKey: ['routers'] });
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
      queryClient.invalidateQueries({ queryKey: ['routers'] });
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
      return response.data;
    },
    onSuccess: () => {
      toast.success('Router reboot initiated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reboot router');
    },
  });
}

// Backup & Restore
export function useCreateRouterBackup() {
  return useMutation({
    mutationFn: async (routerId: number) => {
      const response = await api.post(`/routers/${routerId}/backup`, null, {
        responseType: 'blob',
      });
      
      const filename = `router_${routerId}_backup_${new Date().toISOString().split('T')[0]}.backup`;
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
      toast.success('Router backup created and downloaded');
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
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast.success('Router configuration restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to restore backup');
    },
  });
}

export function useListRouterBackups(routerId: number) {
  return useQuery({
    queryKey: ['router-backups', routerId],
    queryFn: async () => {
      const { data } = await api.get(`/routers/${routerId}/backups`);
      return data;
    },
    enabled: !!routerId,
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

// Fetch all active connections across all routers
export function useAllActiveConnections() {
  const { data: routersData, isLoading: routersLoading } = useRouters();

  return useQuery({
    queryKey: ['all-active-connections', routersData?.items?.map(r => r.id)],
    queryFn: async (): Promise<ActiveConnection[]> => {
      if (!routersData?.items || routersData.items.length === 0) {
        return [];
      }

      const onlineRouters = routersData.items.filter(r => r.status === 'online');

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
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
