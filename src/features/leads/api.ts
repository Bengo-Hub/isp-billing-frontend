import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CONVERTED' | 'LOST';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'ADVERTISEMENT' | 'WALK_IN' | 'PHONE_CALL' | 'OTHER';

export interface Lead {
  id: number;
  organization_id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  estimated_value?: number;
  assigned_to_user_id?: number;
  converted_to_user_id?: number;
  converted_at?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

// Get all leads
export function useLeads(params?: {
  page?: number;
  size?: number;
  status?: LeadStatus;
  source?: LeadSource;
  assigned_to?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async (): Promise<{ leads: Lead[]; total: number }> => {
      const { data } = await api.get('/leads', { params });
      return data;
    },
  });
}

// Get single lead
export function useLead(leadId: number) {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async (): Promise<Lead> => {
      const { data } = await api.get(`/leads/${leadId}`);
      return data;
    },
    enabled: !!leadId,
  });
}

// Create lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      address?: string;
      city?: string;
      source: LeadSource;
      notes?: string;
      estimated_value?: number;
    }) => {
      const response = await api.post('/leads', leadData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create lead');
    },
  });
}

// Update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      const response = await api.patch(`/leads/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update lead');
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: number) => {
      await api.delete(`/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete lead');
    },
  });
}

// Assign lead
export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, assigned_to }: { leadId: number; assigned_to: number }) => {
      const response = await api.patch(`/leads/${leadId}/assign`, { assigned_to });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to assign lead');
    },
  });
}

// Convert lead
export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: number) => {
      const response = await api.post(`/leads/${leadId}/convert`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead converted to customer successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to convert lead');
    },
  });
}
