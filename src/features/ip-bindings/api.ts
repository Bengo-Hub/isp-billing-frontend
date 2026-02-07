import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query/query-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface IPBinding {
  id: string;
  address: string;
  mac_address: string;
  to_address: string;
  server: string;
  type: 'regular' | 'bypassed' | 'blocked';
  comment: string;
  disabled: boolean;
}

export interface IPBindingCreate {
  address?: string;
  mac_address?: string;
  to_address?: string;
  server?: string;
  type: 'regular' | 'bypassed' | 'blocked';
  comment?: string;
  disabled?: boolean;
}

export interface IPBindingUpdate {
  address?: string;
  mac_address?: string;
  to_address?: string;
  server?: string;
  type?: 'regular' | 'bypassed' | 'blocked';
  comment?: string;
  disabled?: boolean;
}

export function useIPBindings(routerId: number | null) {
  return useQuery({
    queryKey: queryKeys.ipBindings.byRouter(String(routerId)),
    queryFn: async (): Promise<IPBinding[]> => {
      const { data } = await api.get(`/ip-bindings/${routerId}`);
      return data;
    },
    enabled: !!routerId,
  });
}

export function useCreateIPBinding(routerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (binding: IPBindingCreate) => {
      const { data } = await api.post(`/ip-bindings/${routerId}`, binding);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ipBindings.byRouter(String(routerId)) });
      toast.success('IP binding created');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to create binding');
    },
  });
}

export function useUpdateIPBinding(routerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bindingId, data }: { bindingId: string; data: IPBindingUpdate }) => {
      const { data: res } = await api.patch(`/ip-bindings/${routerId}/${bindingId}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ipBindings.byRouter(String(routerId)) });
      toast.success('IP binding updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to update binding');
    },
  });
}

export function useDeleteIPBinding(routerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bindingId: string) => {
      await api.delete(`/ip-bindings/${routerId}/${bindingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ipBindings.byRouter(String(routerId)) });
      toast.success('IP binding removed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete binding');
    },
  });
}
