import { api } from '@/lib/api';
import { QUERY_GC_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/lib/query/query-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type UserItem = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  role: 'platform_owner' | 'isp_admin' | 'isp_technician' | 'admin' | 'technician' | 'customer';
  status: 'active' | 'suspended' | 'inactive';
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  last_login?: string;
};

export interface UserUpdateData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
}

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'admin' | 'technician' | 'customer';
  bio?: string;
}

export function useUsers(params: { page?: number; size?: number; role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async (): Promise<{ users: UserItem[]; total: number; page: number; size: number; pages: number }> => {
      const { data } = await api.get('/users/', { params });
      return data;
    },
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

export function useUser(userId: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(String(userId)),
    queryFn: async (): Promise<UserItem> => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserCreateData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: UserUpdateData }) => {
      const response = await api.patch(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: 'active' | 'suspended' | 'inactive' }) => {
      const response = await api.patch(`/users/${userId}/status`, null, {
        params: { status },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user status');
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.patch(`/users/${userId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to activate user');
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.patch(`/users/${userId}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to deactivate user');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    },
  });
}

// Bulk Operations
export function useBulkUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, status }: { userIds: number[]; status: 'active' | 'suspended' | 'inactive' }) => {
      // Execute all updates in parallel
      const promises = userIds.map(userId =>
        api.patch(`/users/${userId}/status`, null, { params: { status } })
      );
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${variables.userIds.length} users updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update users');
    },
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: number[]) => {
      // Execute all deletes in parallel
      const promises = userIds.map(userId => api.delete(`/users/${userId}`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${userIds.length} users deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete users');
    },
  });
}

export function useBulkActivateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: number[]) => {
      const promises = userIds.map(userId => api.patch(`/users/${userId}/activate`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${userIds.length} users activated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to activate users');
    },
  });
}

export function useBulkDeactivateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: number[]) => {
      const promises = userIds.map(userId => api.patch(`/users/${userId}/deactivate`));
      const responses = await Promise.all(promises);
      return responses.map(r => r.data);
    },
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${userIds.length} users deactivated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to deactivate users');
    },
  });
}

// =========================================================================
// Admin Set Password & API Token
// =========================================================================

export function useAdminSetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      const response = await api.post(`/users/${userId}/set-password`, {
        new_password: newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update password');
    },
  });
}

export function useGenerateApiToken() {
  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.post<{
        token: string;
        user_id: number;
        username: string;
        expires_in_days: number;
      }>(`/users/${userId}/generate-api-token`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('API token generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate API token');
    },
  });
}

// =========================================================================
// Scoped User Hooks (staff, customers, platform)
// =========================================================================

type UserListResponse = { users: UserItem[]; total: number; page: number; size: number; pages: number };

export function useStaffUsers(params: { page?: number; size?: number; role?: string; status?: string; search?: string; organization_id?: number }) {
  return useQuery({
    queryKey: ['staff-users', params],
    queryFn: async (): Promise<UserListResponse> => {
      const { data } = await api.get('/users/staff/', { params });
      return data;
    },
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

export function useCustomerUsers(params: { page?: number; size?: number; status?: string; search?: string; organization_id?: number }) {
  return useQuery({
    queryKey: ['customer-users', params],
    queryFn: async (): Promise<UserListResponse> => {
      const { data } = await api.get('/users/customers/', { params });
      return data;
    },
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}

export function usePlatformUsers(params: { page?: number; size?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['platform-users', params],
    queryFn: async (): Promise<UserListResponse> => {
      const { data } = await api.get('/platform/users/', { params });
      return data;
    },
    staleTime: QUERY_STALE_TIMES.STANDARD,
    gcTime: QUERY_GC_TIMES.STANDARD,
  });
}
