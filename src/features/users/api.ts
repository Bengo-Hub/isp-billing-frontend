import { api } from '@/lib/api';
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
  role: 'admin' | 'technician' | 'customer';
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

const usersFallback = {
  users: [
    { id: 1, username: 'jane.doe', email: 'jane@example.com', role: 'admin' as const, status: 'active' as const },
    { id: 2, username: 'john.smith', email: 'john@example.com', role: 'user' as const, status: 'inactive' as const },
    { id: 3, username: 'alice', email: 'alice@example.com', role: 'user' as const, status: 'active' as const },
  ],
  total: 3,
  page: 1,
  size: 3,
  pages: 1,
};

export function useUsers(params: { page?: number; size?: number; role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async (): Promise<{ users: UserItem[]; total: number; page: number; size: number; pages: number }> => {
      try {
        const { data } = await api.get('/users/', { params });
        return data;
      } catch {
        return usersFallback;
      }
    },
  });
}

export function useUser(userId: number) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserItem> => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`${userIds.length} users deactivated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to deactivate users');
    },
  });
}
