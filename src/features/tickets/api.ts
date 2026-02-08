import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicket {
  id: number;
  organization_id: number;
  user_id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  tags?: string;
  attachments?: string;
  assigned_to?: number;
  resolution?: string;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  attachments?: string;
  created_at: string;
}

export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  urgent_tickets: number;
}

// Get all tickets
export function useTickets(params?: {
  page?: number;
  size?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  user_id?: number;
  assigned_to?: number;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async (): Promise<{ tickets: SupportTicket[]; total: number }> => {
      const { data } = await api.get('/tickets', { params });
      return data;
    },
  });
}

// Get single ticket
export function useTicket(ticketId: number) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async (): Promise<SupportTicket> => {
      const { data } = await api.get(`/tickets/${ticketId}`);
      return data;
    },
    enabled: !!ticketId,
  });
}

// Create ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData: {
      user_id: number;
      subject: string;
      description: string;
      priority: TicketPriority;
      category?: string;
      tags?: string;
      attachments?: string;
    }) => {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create ticket');
    },
  });
}

// Update ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: number; [key: string]: any }) => {
      const response = await api.patch(`/tickets/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update ticket');
    },
  });
}

// Assign ticket
export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, assigned_to }: { ticketId: number; assigned_to: number }) => {
      const response = await api.post(`/tickets/${ticketId}/assign`, { assigned_to });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to assign ticket');
    },
  });
}

// Add ticket message
export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, message, is_internal, attachments }: {
      ticketId: number;
      message: string;
      is_internal: boolean;
      attachments?: string;
    }) => {
      const response = await api.post(`/tickets/${ticketId}/messages`, {
        message,
        is_internal,
        attachments,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Message added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add message');
    },
  });
}

// Resolve ticket
export function useResolveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, resolution }: { ticketId: number; resolution: string }) => {
      const response = await api.post(`/tickets/${ticketId}/resolve`, { resolution });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast.success('Ticket resolved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to resolve ticket');
    },
  });
}

// Close ticket
export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: number) => {
      const response = await api.post(`/tickets/${ticketId}/close`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast.success('Ticket closed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to close ticket');
    },
  });
}

// Get ticket statistics
export function useTicketStats() {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async (): Promise<TicketStats> => {
      const { data } = await api.get('/tickets/stats');
      return data;
    },
  });
}
