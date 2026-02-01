/**
 * Authentication store using Zustand with persistence
 */

import { api } from "@/lib/api";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

// SSR-safe storage that only uses localStorage in the browser
const getStorage = (): StateStorage => {
  if (typeof window === "undefined") {
    // Return a no-op storage for SSR
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

/**
 * User role types
 */
export type UserRole = "superuser" | "admin" | "technician" | "customer";

/**
 * Permission structure
 */
export interface Permission {
  module: string;
  actions: string[];
}

// Normalize backend permissions which may be either:
// - [{ module, action }]  (one entry per action)
// - [{ module, actions: [] }] (grouped by module)
export function normalizePermissions(backendPermissions: any[]): Permission[] {
  if (!Array.isArray(backendPermissions)) return [];

  const map = new Map<string, Set<string>>();

  for (const p of backendPermissions) {
    if (!p || typeof p.module !== 'string') continue;

    if (Array.isArray(p.actions)) {
      for (const a of p.actions) {
        if (!a) continue;
        const set = map.get(p.module) ?? new Set<string>();
        set.add(String(a));
        map.set(p.module, set);
      }
    } else if (p.action) {
      const set = map.get(p.module) ?? new Set<string>();
      set.add(String(p.action));
      map.set(p.module, set);
    }
  }

  const result: Permission[] = [];
  for (const [module, actionsSet] of map.entries()) {
    result.push({ module, actions: Array.from(actionsSet) });
  }
  return result;
}

/**
 * Customer portal info for redirect after login
 */
export interface CustomerPortalInfo {
  organization_slug: string;
  subscription_type: 'hotspot' | 'pppoe';
  portal_url: string;
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
  is_verified: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  customerPortalInfo: CustomerPortalInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth actions interface
 */
interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Permission helpers
  hasPermission: (module: string, action: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isSuperuser: () => boolean;
  isAdmin: () => boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
}

/**
 * Auth store with Zustand
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      customerPortalInfo: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Use form data for OAuth2 password flow
          const formData = new URLSearchParams();
          formData.append("username", username);
          formData.append("password", password);

          const response = await api.post("/auth/login", formData, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          console.log('[Auth Store] Login response structure:', {
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            hasUser: !!(response.data as any)?.user,
            hasAccessToken: !!(response.data as any)?.access_token,
          });

          // API response is wrapped: { data: { access_token, user, customer_portal, ... } }
          const responseData = (response.data as any).data || response.data;
          const { access_token, refresh_token, user: backendUser, customer_portal } = responseData;

          // Store tokens in localStorage for API client
          localStorage.setItem("auth-token", access_token);
          if (refresh_token) {
            localStorage.setItem("refresh-token", refresh_token);
          }

          // Also store in cookies for middleware access
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            if (refresh_token) {
              document.cookie = `refresh-token=${refresh_token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
            }
          }

          console.log('[Auth Store] Extracted from response:', {
            hasBackendUser: !!backendUser,
            backendUserRole: backendUser?.role,
            backendUserEmail: backendUser?.email,
            hasAccessToken: !!access_token,
          });

          // If backend didn't return a user payload, avoid accessing its properties
          const normalizedUser = backendUser
            ? ({
                ...backendUser,
                role: ((): UserRole => {
                  switch ((backendUser as any).role) {
                    case 'platform_owner':
                      return 'superuser';
                    case 'isp_admin':
                      return 'admin';
                    case 'isp_technician':
                      return 'technician';
                    default:
                      return 'customer';
                  }
                })(),
                permissions: normalizePermissions((backendUser as any).permissions ?? []),
              } as User)
            : null;

          // Extract customer portal info for customers
          const customerPortalInfo = customer_portal ? {
            organization_slug: customer_portal.organization_slug,
            subscription_type: customer_portal.subscription_type as 'hotspot' | 'pppoe',
            portal_url: customer_portal.portal_url,
          } : null;

          set({
            user: normalizedUser,
            accessToken: access_token,
            refreshToken: refresh_token,
            customerPortalInfo,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('[Auth Store] Login successful, state updated:', {
            hasUser: !!normalizedUser,
            userRole: normalizedUser?.role,
            isAuthenticated: true,
            hasAccessToken: !!access_token,
            hasCustomerPortalInfo: !!customerPortalInfo,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/register", data);
          
          // API response is wrapped: { data: { access_token, user, ... } }
          const responseData = (response.data as any).data || response.data;
          const { access_token, refresh_token, user } = responseData;

          localStorage.setItem("auth-token", access_token);
          if (refresh_token) {
            localStorage.setItem("refresh-token", refresh_token);
          }

          // Also store in cookies for middleware access
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            if (refresh_token) {
              document.cookie = `refresh-token=${refresh_token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
            }
          }

          // Normalize role and permissions for frontend
          const normalizedUser = {
            ...user,
            role: ((): UserRole => {
              switch ((user as any).role) {
                case 'platform_owner':
                  return 'superuser';
                case 'isp_admin':
                  return 'admin';
                case 'isp_technician':
                  return 'technician';
                default:
                  return 'customer';
              }
            })(),
            permissions: normalizePermissions((user as any).permissions ?? []),
          } as User;

          set({
            user: normalizedUser,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Registration failed";
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("refresh-token");

        // Clear cookies
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          localStorage.setItem("auth-token", access_token);
          if (newRefreshToken) {
            localStorage.setItem("refresh-token", newRefreshToken);
          }

          // Also update cookies for middleware access
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            if (newRefreshToken) {
              document.cookie = `refresh-token=${newRefreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
            }
          }

          set({
            accessToken: access_token,
            refreshToken: newRefreshToken || refreshToken,
          });
        } catch {
          get().logout();
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem("auth-token");

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await api.get("/auth/me");
          const backendUser = response.data ?? null;

          // Normalize role and permissions only if backend returned a user
          const normalizedUser = backendUser
            ? ({
                ...backendUser,
                role: ((): UserRole => {
                  switch ((backendUser as any).role) {
                    case 'platform_owner':
                      return 'superuser';
                    case 'isp_admin':
                      return 'admin';
                    case 'isp_technician':
                      return 'technician';
                    default:
                      return 'customer';
                  }
                })(),
                permissions: normalizePermissions((backendUser as any).permissions ?? []),
              } as User)
            : null;

          set({
            user: normalizedUser,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("refresh-token");

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        // Allow callers to clear user safely (e.g., on logout or hydration mismatch)
        if (!user) {
          set({ user: null });
          return;
        }

        const normalizedUser = {
          ...user,
          role: ((): UserRole => {
            switch ((user as any).role) {
              case 'platform_owner':
                return 'superuser';
              case 'isp_admin':
                return 'admin';
              case 'isp_technician':
                return 'technician';
              default:
                return (user as any).role ?? 'customer';
            }
          })(),
          permissions: (user as any).permissions ?? [],
        } as User;
        set({ user: normalizedUser });
      },
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Permission helpers
      hasPermission: (module: string, action: string) => {
        const { user } = get();

        if (!user) return false;

        // Superuser has all permissions
        if (user.role === "superuser") return true;

        // Check user permissions
        const modulePermission = user.permissions.find(
          (p) => p.module === module
        );
        if (!modulePermission) return false;

        return modulePermission.actions.includes(action);
      },

      hasRole: (roles: UserRole | UserRole[]) => {
        const { user } = get();

        if (!user) return false;

        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      isSuperuser: () => {
        const { user } = get();
        return user?.role === "superuser";
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.role === "superuser";
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => {
        const partialState = {
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          customerPortalInfo: state.customerPortalInfo,
          isAuthenticated: state.isAuthenticated,
        };
        console.log('[Auth Store] Partializing state for persist:', {
          hasUser: !!partialState.user,
          userRole: partialState.user?.role,
          isAuthenticated: partialState.isAuthenticated,
          hasAccessToken: !!partialState.accessToken,
          hasCustomerPortalInfo: !!partialState.customerPortalInfo,
        });
        return partialState;
      },
      onRehydrateStorage: () => {
        console.log('[Auth Store] Starting rehydration from localStorage...');
        return (state, error) => {
          if (error) {
            console.error('[Auth Store] Rehydration error:', error);
          } else {
            console.log('[Auth Store] Rehydration complete:', {
              isAuthenticated: state?.isAuthenticated,
              hasUser: !!state?.user,
              userRole: state?.user?.role,
              hasToken: !!state?.accessToken,
            });
          }
        };
      },
    }
  )
);

export type AuthStore = AuthState & AuthActions;
