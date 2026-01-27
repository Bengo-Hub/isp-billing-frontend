import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ImportDataType = 'users' | 'packages' | 'routers' | 'subscriptions';
export type ExportDataType = 'users' | 'packages' | 'routers' | 'subscriptions' | 'payments' | 'all';
export type ExportFormat = 'csv' | 'excel' | 'json';

// Import Data from File
export function useImportData(dataType: ImportDataType) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data_type', dataType);
      
      const response = await api.post(`/import/${dataType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [dataType] });
      toast.success(`Successfully imported ${data.imported_count || 0} ${dataType}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || `Failed to import ${dataType}`);
    },
  });
}

// Export Data
export interface ExportDataRequest {
  data_type: ExportDataType;
  format: ExportFormat;
  filters?: Record<string, any>;
  include_fields?: string[];
  exclude_fields?: string[];
}

export function useExportData() {
  return useMutation({
    mutationFn: async (request: ExportDataRequest) => {
      const response = await api.post('/export/data', request, {
        responseType: 'blob',
      });
      
      // Determine file extension
      const extension = request.format === 'excel' ? 'xlsx' : request.format;
      const filename = `${request.data_type}_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      // Create download link
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
    onSuccess: (_, variables) => {
      toast.success(`${variables.data_type} exported successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export data');
    },
  });
}

// Export Users
export function useExportUsers() {
  return useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters?: Record<string, any> }) => {
      const response = await api.get('/export/users', {
        params: { format, ...filters },
        responseType: 'blob',
      });
      
      const extension = format === 'excel' ? 'xlsx' : format;
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
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
      toast.success('Users exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export users');
    },
  });
}

// Export Packages
export function useExportPackages() {
  return useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters?: Record<string, any> }) => {
      const response = await api.get('/export/plans', {
        params: { format, ...filters },
        responseType: 'blob',
      });
      
      const extension = format === 'excel' ? 'xlsx' : format;
      const filename = `packages_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
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
      toast.success('Packages exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export packages');
    },
  });
}

// Export Payments
export function useExportPayments() {
  return useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters?: Record<string, any> }) => {
      const response = await api.get('/export/payments', {
        params: { format, ...filters },
        responseType: 'blob',
      });
      
      const extension = format === 'excel' ? 'xlsx' : format;
      const filename = `payments_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
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
      toast.success('Payments exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export payments');
    },
  });
}

// Import Template Download
export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: async (dataType: ImportDataType) => {
      const response = await api.get(`/import/template/${dataType}`, {
        responseType: 'blob',
      });
      
      const filename = `${dataType}_import_template.xlsx`;
      
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
    onSuccess: (_, dataType) => {
      toast.success(`${dataType} template downloaded successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to download template');
    },
  });
}

// Validate Import File
export function useValidateImport(dataType: ImportDataType) {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/import/${dataType}/validate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      if (data.is_valid) {
        toast.success(`File validated successfully. ${data.valid_rows} valid rows found.`);
      } else {
        toast.error(`Validation failed. ${data.errors?.length || 0} errors found.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to validate file');
    },
  });
}

// Get Import History
export function useImportHistory(params?: { page?: number; size?: number; data_type?: ImportDataType }) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get('/import/history', { params });
      return response.data;
    },
  });
}

// Backup All Data
export function useBackupAllData() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/backup/create', null, {
        responseType: 'blob',
      });
      
      const filename = `codevertex_backup_${new Date().toISOString().split('T')[0]}.zip`;
      
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
      toast.success('Backup created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create backup');
    },
  });
}

// Restore from Backup
export function useRestoreBackup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/backup/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all queries as data may have changed
      queryClient.invalidateQueries();
      toast.success('Backup restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to restore backup');
    },
  });
}

