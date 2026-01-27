import axios from 'axios';
import { create } from 'zustand';
import { useAuthStore } from './auth-store';

export interface ApiState {
  baseUrl: string;
  getAuthHeaders: () => Record<string, string>;
  makeRequest: <T>(endpoint: string, options?: any) => Promise<T>;
}

export const useApiStore = create<ApiState>((set, get) => ({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',

  getAuthHeaders: () => {
    const token = useAuthStore.getState().accessToken;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },

  makeRequest: async <T>(endpoint: string, options: any = {}) => {
    const { baseUrl, getAuthHeaders } = get();
    
    const url = `${baseUrl}${endpoint}`;
    const headers = getAuthHeaders();

    try {
      const response = await axios({
        url,
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        useAuthStore.getState().logout();
        throw new Error('Authentication required');
      }
      throw new Error(`API request failed: ${error.response?.data?.message || error.message}`);
    }
  },
}));
