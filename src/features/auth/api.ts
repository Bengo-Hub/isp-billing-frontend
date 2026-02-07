import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  company_name?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface VerificationData {
  token: string;
  verification_type: 'email' | 'phone';
}

// Register/Signup
export function useRegister() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Registration failed');
    },
  });
}

// Forgot Password
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset instructions sent to your email');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send reset email');
    },
  });
}

// Reset Password
export function useResetPassword() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully! You can now login with your new password.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    },
  });
}

// Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    },
  });
}

// Verify User (Email/Phone)
export function useVerifyUser() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: VerificationData) => {
      const response = await api.post('/auth/verify', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account verified successfully! You can now login.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Verification failed');
    },
  });
}

// Resend Verification
export function useResendVerification() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send verification');
    },
  });
}

// Get User Sessions
export function useUserSessions(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['user-sessions', params],
    queryFn: async () => {
      const { data } = await api.get('/auth/sessions', { params });
      return data;
    },
  });
}

// Revoke Session
export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast.success('Session revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to revoke session');
    },
  });
}

// Revoke All Sessions
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/auth/sessions');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast.success('All sessions revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to revoke sessions');
    },
  });
}

// Refresh Token
export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      return response.data;
    },
    onSuccess: (data) => {
      // Update token in localStorage (store uses this for persistence)
      localStorage.setItem('auth-token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh-token', data.refresh_token);
      }
      toast.success('Session refreshed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to refresh session');
    },
  });
}


// ---------------------------------------------------------------------------
// Two-Factor Authentication
// ---------------------------------------------------------------------------

export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  otpauth_url: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  method: string;
  confirmed_at: string | null;
}

export function use2FAStatus() {
  return useQuery<TwoFactorStatus>({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const { data } = await api.get('/auth/2fa/status');
      return data;
    },
  });
}

export function useSetup2FA() {
  return useMutation<TwoFactorSetup>({
    mutationFn: async () => {
      const { data } = await api.post('/auth/2fa/setup');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate 2FA setup');
    },
  });
}

export function useVerify2FA() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; recovery_codes: string[]; message: string }, any, { code: string }>({
    mutationFn: async ({ code }) => {
      const { data } = await api.post('/auth/2fa/verify', { code });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, any, { password: string }>({
    mutationFn: async ({ password }) => {
      const { data } = await api.post('/auth/2fa/disable', { password });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      toast.success('Two-factor authentication disabled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to disable 2FA');
    },
  });
}

export function useRegenerateRecoveryCodes() {
  return useMutation<{ recovery_codes: string[]; message: string }>({
    mutationFn: async () => {
      const { data } = await api.get('/auth/2fa/recovery-codes');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to regenerate recovery codes');
    },
  });
}

export function useAuthenticate2FA() {
  return useMutation<any, any, { temp_token: string; code: string }>({
    mutationFn: async ({ temp_token, code }) => {
      const { data } = await api.post('/auth/2fa/authenticate', { temp_token, code });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
    },
  });
}