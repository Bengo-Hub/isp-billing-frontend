import { api } from '@/lib/api';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRBACStore } from './rbac';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  role: 'superuser' | 'admin' | 'technician' | 'customer';
  status: string;
  is_verified: boolean;
  is_active: boolean;
  avatar_url?: string;
  bio?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
  phone_verified_at?: string;
  full_name: string;
  permissions?: Array<{
    id: number;
    module: string;
    action: string;
    resource?: string;
    description?: string;
  }>;
  licence?: {
    id: number;
    licence_key: string;
    organization_name: string;
    contact_email: string;
    contact_phone?: string;
    licence_type: string;
    is_active: boolean;
    max_users: number;
    max_routers: number;
    trial_days: number;
    trial_started_at?: string;
    trial_expires_at?: string;
    subscription_started_at?: string;
    subscription_expires_at?: string;
    auto_renew: boolean;
    is_trial_active: boolean;
    days_remaining: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Backend expects form data (OAuth2PasswordRequestForm)
          // Create form data with username and password
          const formData = new URLSearchParams();
          formData.append('username', email);  // Backend accepts email as username
          formData.append('password', password);
          
          const response = await api.post('/auth/login', formData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          const { access_token, user } = response.data;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Update RBAC store
          const rbacStore = useRBACStore.getState();
          rbacStore.setUserRole(user.role);
          rbacStore.setUserPermissions(user.permissions || []);
          rbacStore.setLicence(user.licence || null);

          toast.success('Login successful');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', data);

          const { access_token, user } = response.data;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Update RBAC store
          const rbacStore = useRBACStore.getState();
          rbacStore.setUserRole(user.role);
          rbacStore.setUserPermissions(user.permissions || []);
          rbacStore.setLicence(user.licence || null);

          toast.success('Account created successfully');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Registration failed';
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear RBAC store
        const rbacStore = useRBACStore.getState();
        rbacStore.resetRBAC();

        toast.success('Logged out successfully');
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
        
        // Update RBAC store
        const rbacStore = useRBACStore.getState();
        rbacStore.setUserRole(user.role);
        rbacStore.setUserPermissions(user.permissions || []);
        rbacStore.setLicence(user.licence || null);
      },

      setToken: (token: string) => {
        set({ token });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear RBAC store
        const rbacStore = useRBACStore.getState();
        rbacStore.resetRBAC();
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          get().clearAuth();
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });

          // Update RBAC store
          const rbacStore = useRBACStore.getState();
          rbacStore.setUserRole(response.data.role);
          rbacStore.setUserPermissions(response.data.permissions || []);
          rbacStore.setLicence(response.data.licence || null);
        } catch (error) {
          set({ isLoading: false });
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);