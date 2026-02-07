import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type VoucherStatus = 'active' | 'used' | 'expired' | 'disabled';

export interface VoucherItem {
  id: number;
  code: string;
  status: VoucherStatus;
  plan_id: number | null;
  plan_name: string | null;
  organization_id: number | null;
  hotspot_username: string | null;
  data_limit_bytes: number | null;
  time_limit_seconds: number | null;
  bandwidth_limit: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  batch_id: number | null;
}

export interface VoucherListResponse {
  vouchers: VoucherItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface VoucherStats {
  total_vouchers: number;
  active_vouchers: number;
  used_vouchers: number;
  expired_vouchers: number;
}

export interface VoucherFilters {
  page?: number;
  size?: number;
  status?: VoucherStatus;
  search?: string;
  plan_id?: number;
}

export interface VoucherGenerateData {
  plan_id: number;
  count: number;
  code_format?: string;
}

export interface VoucherUpdateData {
  status?: VoucherStatus;
  expires_at?: string;
}

// List vouchers with filters
export function useVouchers(params: VoucherFilters = {}) {
  return useQuery({
    queryKey: ['vouchers', params],
    queryFn: async (): Promise<VoucherListResponse> => {
      const { data } = await api.get('/vouchers/', { params });
      return data;
    },
  });
}

// Get voucher stats
export function useVoucherStats() {
  return useQuery({
    queryKey: ['voucher-stats'],
    queryFn: async (): Promise<VoucherStats> => {
      const { data } = await api.get('/vouchers/stats');
      return data;
    },
  });
}

// Get single voucher
export function useVoucher(voucherId: number) {
  return useQuery({
    queryKey: ['voucher', voucherId],
    queryFn: async (): Promise<VoucherItem> => {
      const { data } = await api.get(`/vouchers/${voucherId}`);
      return data;
    },
    enabled: !!voucherId,
  });
}

// Generate vouchers (batch create)
export function useGenerateVouchers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VoucherGenerateData) => {
      const response = await api.post('/vouchers/generate', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-stats'] });
      toast.success(data?.message || 'Vouchers generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate vouchers');
    },
  });
}

// Update voucher
export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voucherId, data }: { voucherId: number; data: VoucherUpdateData }) => {
      const response = await api.patch(`/vouchers/${voucherId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-stats'] });
      toast.success('Voucher updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update voucher');
    },
  });
}

// Delete voucher
export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voucherId: number) => {
      await api.delete(`/vouchers/${voucherId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-stats'] });
      toast.success('Voucher deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete voucher');
    },
  });
}
