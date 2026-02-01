import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type CampaignType = 'SMS' | 'EMAIL' | 'WHATSAPP' | 'BOTH';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface Campaign {
  id: number;
  organization_id: number;
  name: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  scheduled_date?: string;
  recipients_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  message_content?: string;
  email_subject?: string;
  email_content?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

// Get all campaigns
export function useCampaigns(params?: {
  page?: number;
  size?: number;
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  search?: string;
}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const { data } = await api.get('/campaigns', { params });
      return data;
    },
  });
}

// Get single campaign
export function useCampaign(campaignId: number) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const { data } = await api.get(`/campaigns/${campaignId}`);
      return data;
    },
    enabled: !!campaignId,
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: {
      name: string;
      campaign_type: CampaignType;
      scheduled_date?: string;
      message_content?: string;
      email_subject?: string;
      email_content?: string;
    }) => {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      const response = await api.patch(`/campaigns/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update campaign');
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      await api.delete(`/campaigns/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete campaign');
    },
  });
}

// Pause campaign
export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await api.patch(`/campaigns/${campaignId}/pause`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign paused');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to pause campaign');
    },
  });
}

// Resume campaign
export function useResumeCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await api.patch(`/campaigns/${campaignId}/resume`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign resumed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to resume campaign');
    },
  });
}

// Get campaign analytics
export function useCampaignAnalytics(campaignId: number) {
  return useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async (): Promise<CampaignAnalytics> => {
      const { data } = await api.get(`/campaigns/${campaignId}/analytics`);
      return data;
    },
    enabled: !!campaignId,
  });
}
