import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type SettingsCategory = 'system' | 'payments' | 'pppoe' | 'hotspot' | 'sms' | 'whatsapp' | 'notifications';

export type SettingsMap = Record<string, any>;

const fallbackByCategory: Record<SettingsCategory, SettingsMap> = {
  system: {
    'system.company_name': 'Codevertex Africa Limited',
    'system.primary_color': '#9100B0',
    'system.font': 'Inter',
    'system.support_email': 'support@codevertexitsolutions.com',
    'system.support_phone': '+254 743 793901',
    'system.require_terms_consent': true,
    'system.terms_text': 'By using our WiFi, you agree to fair usage and community-friendly rules.'
  },
  payments: {
    'payments.default_gateway': 'bank',
    'payments.bank_paybill': '542542',
    'payments.bank_account_number': '00104981083050'
  },
  pppoe: {
    'pppoe.prune_inactive_days': 14,
    'pppoe.reminder_times_days': [5, 2, 0.16], // 0.16 ~ 4 hours
    'pppoe.enable_invoices': false
  },
  hotspot: {
    'hotspot.username_prefix': 'C',
    'hotspot.template': 'Aurora',
    'hotspot.prune_inactive_days': 14,
    'hotspot.redirect_url': 'https://www.google.com'
  },
  sms: {
    'sms.gateway_provider': 'twilio',
    'sms.enable_balance_alert': false
  },
  whatsapp: {
    'whatsapp.enabled': false,
    'whatsapp.provider': 'apiwap',
    'whatsapp.send_payment_confirmation': false,
    'whatsapp.send_expiry_notifications': false,
    'whatsapp.send_reminder_notifications': false,
    'whatsapp.prefer_whatsapp_for_expiry': false,
    'whatsapp.prefer_whatsapp_for_reminders': false,
    'whatsapp.prefer_whatsapp_for_payment': false,
    'whatsapp.payment_hotspot_template': 'Hello @username! You have successfully subscribed to @package_name. Your internet access will expire on @expiry_date. Thank you for choosing @company_name!',
    'whatsapp.payment_pppoe_template': 'Hello @username! Your @package_name subscription is active. Username: @username, Password: @password. Expiry: @expiry_date. Support: @company_name',
    'whatsapp.expiry_template': 'Hi @first_name, your @package_name subscription expires on @expiry_date. Please renew to continue enjoying our services. @company_name',
    'whatsapp.reminder_template': 'Reminder: Your internet subscription expires in @days_left days (@expiry_date). Renew now to avoid disconnection. @company_name'
  },
  notifications: {
    'notifications.mikrotik_status_enabled': false,
    'notifications.payment_hotspot_template': 'Dear @username, you have successfully subscribed to @package_name. Expiry @expiry_date.',
    'notifications.payment_pppoe_template': 'Dear customer, subscription to @package_name. Expiry @expiry_date.',
    'notifications.expiry_hotspot': false,
    'notifications.expiry_pppoe': false,
    'notifications.reminder_hotspot': false,
    'notifications.reminder_pppoe': false,
    'notifications.email_subscription_enable': true,
    'notifications.email_subject_pppoe': 'Your subscription expires in @days_left days',
    'notifications.email_template_pppoe': 'Dear @first_name, your internet will expire in @days_left days on @expiry_date.'
  }
};

export function useSettings(category: SettingsCategory) {
  return useQuery({
    queryKey: ['settings', category],
    queryFn: async (): Promise<SettingsMap> => {
      try {
        const { data } = await api.get('/configuration/', { params: { category } });
        const map: SettingsMap = {};
        for (const cfg of data.configurations ?? []) {
          map[cfg.key] = cfg.value;
        }
        return Object.keys(map).length ? map : fallbackByCategory[category];
      } catch {
        return fallbackByCategory[category];
      }
    },
    staleTime: 60_000,
    initialData: fallbackByCategory[category],
  });
}

export function useSaveSetting(category: SettingsCategory) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kv: SettingsMap) => {
      // Save each key individually (API is one-per-request)
      const entries = Object.entries(kv);
      for (const [key, value] of entries) {
        await api.post('/configuration/', {
          key,
          value,
          config_type: 'json',
          category,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    },
  });
}

// Export Settings
export function useExportSettings() {
  return useMutation({
    mutationFn: async (category?: SettingsCategory) => {
      const params = category ? { category } : {};
      const response = await api.get('/configuration/export', {
        params,
        responseType: 'blob',
      });
      
      const filename = category 
        ? `${category}_settings_${new Date().toISOString().split('T')[0]}.json`
        : `all_settings_${new Date().toISOString().split('T')[0]}.json`;
      
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
      toast.success('Settings exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export settings');
    },
  });
}

// Import Settings
export function useImportSettings(category: SettingsCategory) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      const response = await api.post('/configuration/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['settings', category] });
      toast.success(`${data.imported_count || 0} settings imported successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to import settings');
    },
  });
}

// Reset Settings to Defaults
export function useResetSettings() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: SettingsCategory) => {
      const response = await api.post(`/configuration/reset`, { category });
      return response.data;
    },
    onSuccess: (_, category) => {
      qc.invalidateQueries({ queryKey: ['settings', category] });
      toast.success('Settings reset to defaults');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reset settings');
    },
  });
}

// Upload Logo
export function useUploadLogo() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/configuration/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['settings', 'general'] });
      toast.success('Logo uploaded successfully');
      return data.logo_url;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    },
  });
}

// Delete Logo
export function useDeleteLogo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/configuration/logo');
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'general'] });
      toast.success('Logo deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete logo');
    },
  });
}

// =========================================================================
// Tenant Settings API (OrganizationSettings-based)
// =========================================================================

/** Common IANA timezones offered in the organization settings selector. */
export const TIMEZONE_OPTIONS = [
  'Africa/Nairobi',
  'Africa/Lagos',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Accra',
  'Africa/Dar_es_Salaam',
  'Africa/Kampala',
  'Africa/Kigali',
  'Africa/Addis_Ababa',
  'UTC',
  'Europe/London',
  'America/New_York',
] as const;

export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

// Organization details (GET/PATCH /tenant/settings/organization).
export interface OrganizationDetails {
  id: number;
  name: string;
  slug: string;
  organization_type: string;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  primary_color: string;
  currency: string;
  /** IANA timezone name (e.g. "Africa/Nairobi"). Defaults to Africa/Nairobi. */
  timezone?: string;
  trial_ends_at?: string;
  subscription_status?: string;
  max_routers: number;
  max_customers?: number;
}

// Fields the ISP admin can update on their organization.
export interface OrganizationDetailsUpdate {
  name?: string;
  organization_type?: string;
  email?: string;
  phone?: string;
  address?: string;
  /** IANA timezone name. Used to sync router clocks to local time. */
  timezone?: string;
}

export function useOrganizationDetails() {
  return useQuery({
    queryKey: ['tenant-settings', 'organization'],
    queryFn: async (): Promise<OrganizationDetails> => {
      const { data } = await api.get('/tenant/settings/organization');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSaveOrganizationDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: OrganizationDetailsUpdate) => {
      const { data } = await api.patch('/tenant/settings/organization', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'organization'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save organization settings');
    },
  });
}

export interface HotspotSettings {
  username_prefix: string;
  hotspot_template: string;
  prune_inactive_users_days: number;
  redirect_url: string;
  voucher_format: string;
  voucher_length: number;
  show_packages_on_portal: boolean;
  allow_guest_purchases: boolean;
  session_timeout_minutes: number;
  auto_disconnect_expired: boolean;
}

export interface PPPoESettings {
  require_username_approval: boolean;
  allow_self_registration: boolean;
  session_timeout_minutes: number;
  auto_disconnect_expired: boolean;
  /** Churn window: duration-less accounts are suspended after this many days (default 14). */
  auto_suspend_days: number;
}

// Hotspot Settings - uses dedicated endpoint instead of Configuration table
export function useHotspotSettings() {
  return useQuery({
    queryKey: ['tenant-settings', 'hotspot'],
    queryFn: async (): Promise<HotspotSettings> => {
      const { data } = await api.get('/tenant/settings/hotspot');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSaveHotspotSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<HotspotSettings>) => {
      const { data } = await api.patch('/tenant/settings/hotspot', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'hotspot'] });
      toast.success('Hotspot settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save hotspot settings');
    },
  });
}

// PPPoE Settings - uses dedicated endpoint instead of Configuration table
export function usePPPoESettings() {
  return useQuery({
    queryKey: ['tenant-settings', 'pppoe'],
    queryFn: async (): Promise<PPPoESettings> => {
      const { data } = await api.get('/tenant/settings/pppoe');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSavePPPoESettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<PPPoESettings>) => {
      const { data } = await api.patch('/tenant/settings/pppoe', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'pppoe'] });
      toast.success('PPPoE settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save PPPoE settings');
    },
  });
}

// =========================================================================
// Notification settings — dedicated endpoint (OrganizationSettings columns the
// SMS/email senders actually read), NOT the generic Configuration KV store.
// =========================================================================
export interface NotificationSettings {
  enable_mikrotik_status_notifications: boolean;
  send_hotspot_payment_confirmation: boolean;
  hotspot_payment_confirmation_sms: string;
  send_pppoe_payment_confirmation: boolean;
  pppoe_payment_confirmation_sms: string;
  send_hotspot_expiry_notification: boolean;
  hotspot_expiry_notification_sms: string;
  send_pppoe_expiry_notification: boolean;
  pppoe_expiry_notification_sms: string;
  send_hotspot_expiry_reminder: boolean;
  hotspot_expiry_reminder_sms: string;
  send_pppoe_expiry_reminder: boolean;
  pppoe_expiry_reminder_sms: string;
  enable_email_subscription_reminders: boolean;
  send_pppoe_email_reminders: boolean;
  pppoe_email_reminder_subject: string;
  pppoe_email_reminder_message: string;
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['tenant-settings', 'notifications'],
    queryFn: async (): Promise<NotificationSettings> => {
      const { data } = await api.get('/tenant/settings/notifications');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSaveNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const { data } = await api.patch('/tenant/settings/notifications', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'notifications'] });
      toast.success('Notification settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save notification settings');
    },
  });
}

// =========================================================================
// WhatsApp settings — dedicated endpoint (OrganizationSettings): per-event
// toggles + templates the WhatsApp sender reads.
// =========================================================================
export interface WhatsAppSettings {
  whatsapp_provider: string | null;
  whatsapp_enabled: boolean;
  send_hotspot_payment_confirmation_whatsapp: boolean;
  hotspot_payment_confirmation_whatsapp: string;
  send_pppoe_payment_confirmation_whatsapp: boolean;
  pppoe_payment_confirmation_whatsapp: string;
  send_hotspot_expiry_notification_whatsapp: boolean;
  hotspot_expiry_notification_whatsapp: string;
  send_pppoe_expiry_notification_whatsapp: boolean;
  pppoe_expiry_notification_whatsapp: string;
  send_hotspot_expiry_reminder_whatsapp: boolean;
  hotspot_expiry_reminder_whatsapp: string;
  send_pppoe_expiry_reminder_whatsapp: boolean;
  pppoe_expiry_reminder_whatsapp: string;
}

export function useWhatsAppSettings() {
  return useQuery({
    queryKey: ['tenant-settings', 'whatsapp'],
    queryFn: async (): Promise<WhatsAppSettings> => {
      const { data } = await api.get('/tenant/settings/whatsapp');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSaveWhatsAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<WhatsAppSettings>) => {
      const { data } = await api.patch('/tenant/settings/whatsapp', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'whatsapp'] });
      toast.success('WhatsApp settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save WhatsApp settings');
    },
  });
}

// =========================================================================
// Branding settings — dedicated endpoint (OrganizationSettings / Organization).
// =========================================================================
export interface BrandingSettings {
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  custom_css: string | null;
  portal_title: string | null;
  portal_welcome_message: string | null;
}

export function useBrandingSettings() {
  return useQuery({
    queryKey: ['tenant-settings', 'branding'],
    queryFn: async (): Promise<BrandingSettings> => {
      const { data } = await api.get('/tenant/settings/branding');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSaveBrandingSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<BrandingSettings>) => {
      const { data } = await api.patch('/tenant/settings/branding', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'branding'] });
      toast.success('Branding settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save branding settings');
    },
  });
}

// =========================================================================
// Business settings — dedicated endpoint (OrganizationSettings): currency, tax,
// invoice prefix/notes, terms, privacy.
// =========================================================================
export interface BusinessSettings {
  currency: string;
  tax_rate: number;
  invoice_prefix: string | null;
  invoice_notes: string | null;
  terms_and_conditions: string | null;
  privacy_policy: string | null;
}

export function useBusinessSettings() {
  return useQuery({
    queryKey: ['tenant-settings', 'business'],
    queryFn: async (): Promise<BusinessSettings> => {
      const { data } = await api.get('/tenant/settings/business');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSaveBusinessSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<BusinessSettings>) => {
      const { data } = await api.patch('/tenant/settings/business', settings);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-settings', 'business'] });
      toast.success('Business settings saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save business settings');
    },
  });
}
