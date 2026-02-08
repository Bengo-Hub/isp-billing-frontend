/**
 * Onboarding API hooks for the multi-step ISP provider signup flow.
 *
 * Backend endpoints: /api/v1/onboarding/*
 */

import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// =========================================================================
// Types
// =========================================================================

interface EmailCheckResponse {
  available: boolean;
  message: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
}

interface BusinessDetailsRequest {
  email: string;
  business_name: string;
  business_type: 'HOTSPOT' | 'PPPOE' | 'HYBRID';
  phone: string;
  country?: string;
  city?: string;
}

interface SecuritySetupRequest {
  email: string;
  admin_first_name: string;
  admin_last_name: string;
  password: string;
  confirm_password: string;
}

interface OnboardingCompleteResponse {
  success: boolean;
  message: string;
  organization_id: number | null;
  organization_slug: string | null;
  access_token: string | null;
  token_type: string;
}

// =========================================================================
// Hooks
// =========================================================================

/** Step 1: Check if email is available for registration. */
export function useCheckEmail() {
  return useMutation({
    mutationFn: async (data: { email: string }): Promise<EmailCheckResponse> => {
      const response = await api.post<EmailCheckResponse>('/onboarding/check-email', data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to check email availability');
    },
  });
}

/** Step 2: Send a 6-digit verification code to the given email. */
export function useSendVerification() {
  return useMutation({
    mutationFn: async (data: { email: string }): Promise<VerificationResponse> => {
      const response = await api.post<VerificationResponse>('/onboarding/send-verification', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification code sent! Check your email.');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send verification code');
    },
  });
}

/** Step 3: Verify the 6-digit email code. */
export function useVerifyCode() {
  return useMutation({
    mutationFn: async (data: { email: string; verification_code: string }): Promise<VerificationResponse> => {
      const response = await api.post<VerificationResponse>('/onboarding/verify-code', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Invalid verification code');
    },
  });
}

/** Step 4: Submit business details (name, type, phone, location). */
export function useSubmitBusinessDetails() {
  return useMutation({
    mutationFn: async (data: BusinessDetailsRequest): Promise<VerificationResponse> => {
      const response = await api.post<VerificationResponse>('/onboarding/business-details', data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save business details');
    },
  });
}

/** Step 5 (final): Create admin account, organization, and activate trial. */
export function useCompleteRegistration() {
  return useMutation({
    mutationFn: async (data: SecuritySetupRequest): Promise<OnboardingCompleteResponse> => {
      const response = await api.post<OnboardingCompleteResponse>('/onboarding/security-setup', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Account created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Registration failed');
    },
  });
}
