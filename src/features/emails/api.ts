import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type EmailStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'OPENED' | 'CLICKED';

export interface Email {
  id: number;
  organization_id: number;
  to_email: string;
  to_name?: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  attachments?: string;
  status: EmailStatus;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  campaign_id?: number;
  user_id?: number;
  sent_by_user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: number;
  organization_id: number;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  created_at: string;
  updated_at: string;
}

// Get all emails
export function useEmails(params?: {
  page?: number;
  size?: number;
  status?: EmailStatus;
  campaign_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: async (): Promise<{ emails: Email[]; total: number }> => {
      const { data } = await api.get('/emails', { params });
      // Backend returns the list under `items` (EmailListResponse); map to `emails`.
      return { emails: data.items ?? data.emails ?? [], total: data.total ?? 0 };
    },
  });
}

// Get single email
export function useEmail(emailId: number) {
  return useQuery({
    queryKey: ['email', emailId],
    queryFn: async (): Promise<Email> => {
      const { data } = await api.get(`/emails/${emailId}`);
      return data;
    },
    enabled: !!emailId,
  });
}

// Send email
export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailData: {
      to_email: string;
      to_name?: string;
      cc?: string;
      bcc?: string;
      subject: string;
      body_text?: string;
      body_html?: string;
      attachments?: string;
    }) => {
      const response = await api.post('/emails/send', emailData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send email');
    },
  });
}

// Get email templates
export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data } = await api.get('/emails/templates');
      return data.templates || data;
    },
  });
}

// Create email template
export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData: {
      name: string;
      subject: string;
      body_html: string;
      body_text?: string;
    }) => {
      const response = await api.post('/emails/templates', templateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Email template created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create template');
    },
  });
}
