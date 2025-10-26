import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type SettingsCategory = 'system' | 'payments' | 'pppoe' | 'hotspot' | 'sms' | 'notifications';

export type SettingsMap = Record<string, any>;

const fallbackByCategory: Record<SettingsCategory, SettingsMap> = {
  system: {
    'system.company_name': 'Codevertex IT Solutions',
    'system.primary_color': '#ec4899',
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
          config_type: 'JSON',
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
