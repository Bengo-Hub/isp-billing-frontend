/**
 * Axios API client with interceptors for authentication and error handling
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

// API configuration
//
// Defensive https upgrade: if the app is served over HTTPS but NEXT_PUBLIC_API_URL
// was (mis)configured as http://, the browser blocks every call as mixed content.
// Upgrade http->https at runtime (except localhost/127.0.0.1 dev) so a bad build
// env can never silently break the dashboard.
function resolveApiUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.startsWith("http://") &&
    !/\/\/(localhost|127\.0\.0\.1)/.test(url)
  ) {
    url = url.replace(/^http:\/\//, "https://");
  }
  return url;
}

const API_URL = resolveApiUrl();
const TIMEOUT = 30000;

// ── SSO refresh mutex (Phase 1c) ────────────────────────────────────────────
// SSO-issued sessions are marked with localStorage["auth-source-sso"]. Their
// access tokens must be refreshed against the central SSO, not the local
// backend. A module-level mutex coalesces concurrent 401s into a single
// refresh request (thundering-herd guard). Local sessions are unaffected and
// keep using the existing local /auth/refresh path below.
const SSO_BASE_URL =
  process.env.NEXT_PUBLIC_SSO_URL || "https://sso.codevertexitsolutions.com";
const SSO_CLIENT_ID =
  process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "isp-billing-ui";

let ssoRefreshPromise: Promise<string | null> | null = null;

function isSSOSession(): boolean {
  return (
    typeof window !== "undefined" &&
    localStorage.getItem("auth-source-sso") === "1"
  );
}

async function refreshSSOAccessToken(): Promise<string | null> {
  if (ssoRefreshPromise) return ssoRefreshPromise;

  ssoRefreshPromise = (async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refresh-token");
      if (!refreshToken) return null;

      // Bypass the configured `client` instance (baseURL = local API).
      const resp = await axios.post(
        `${SSO_BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken, client_id: SSO_CLIENT_ID },
        { headers: { "Content-Type": "application/json" } }
      );

      const accessToken: string | undefined = resp.data?.access_token;
      const newRefresh: string | undefined = resp.data?.refresh_token;
      if (!accessToken) return null;

      localStorage.setItem("auth-token", accessToken);
      if (newRefresh) localStorage.setItem("refresh-token", newRefresh);
      if (typeof document !== "undefined") {
        document.cookie = `auth-token=${accessToken}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        if (newRefresh) {
          document.cookie = `refresh-token=${newRefresh}; path=/; max-age=${
            30 * 24 * 60 * 60
          }; SameSite=Lax`;
        }
      }
      return accessToken;
    } catch {
      return null;
    } finally {
      ssoRefreshPromise = null;
    }
  })();

  return ssoRefreshPromise;
}

/**
 * Standardized API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Standardized API error format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    field_errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  fieldErrors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>,
    fieldErrors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Create and configure Axios instance
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    timeout: TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add auth token and org slug
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== "undefined") {
        // Add auth token
        const token = localStorage.getItem("auth-token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add organization slug header for tenant context
        // Extract org_slug from current URL path (e.g., /demo-isp/dashboard)
        const pathname = window.location.pathname;
        const orgMatch = pathname.match(/^\/([^\/]+)\//);

        if (orgMatch) {
          const potentialOrgSlug = orgMatch[1];
          // Exclude platform and other special routes
          if (potentialOrgSlug !== 'platform' &&
              potentialOrgSlug !== 'login' &&
              potentialOrgSlug !== 'signup' &&
              potentialOrgSlug !== 'buy' &&
              !potentialOrgSlug.startsWith('_')) {
            config.headers['X-Organization-Slug'] = potentialOrgSlug;
          }
        }

        // Fallback: Try to get org_slug from auth store
        if (!config.headers['X-Organization-Slug']) {
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const authState = JSON.parse(authStorage);
              const orgSlug = authState.state?.organizationInfo?.organization_slug ||
                             authState.state?.customerPortalInfo?.organization_slug;
              if (orgSlug) {
                config.headers['X-Organization-Slug'] = orgSlug;
              }
            }
          } catch {
            // Ignore parsing errors
          }
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // Skip the refresh/logout cascade for /auth/me: during the brief
      // post-login JIT/sync window a 401 there is transient, and the callers
      // (completeSSOLogin / checkAuth) run their own retry/clear logic. Handling
      // it here would risk refresh loops. (Per the SSO integration guide.)
      const reqUrl = (originalRequest?.url || "").toString();
      const isMeRequest = reqUrl.includes("/auth/me");

      // Handle 401 Unauthorized - try token refresh (only in browser)
      if (
        typeof window !== "undefined" &&
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isMeRequest
      ) {
        originalRequest._retry = true;

        // DUAL-RUN: SSO sessions refresh against the central SSO (mutex-guarded).
        // Local sessions fall through to the existing local-backend refresh below.
        if (isSSOSession()) {
          const newAccessToken = await refreshSSOAccessToken();
          if (newAccessToken) {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return client(originalRequest);
          }
          // SSO refresh failed — clear auth; let AuthGuard handle the redirect.
          localStorage.removeItem("auth-token");
          localStorage.removeItem("refresh-token");
          localStorage.removeItem("auth-source-sso");
          localStorage.removeItem("auth-storage");
        } else
        try {
          // Attempt to refresh token
          const refreshToken = localStorage.getItem("refresh-token");
          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data.data;
            localStorage.setItem("auth-token", access_token);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return client(originalRequest);
          }
        } catch {
          // Refresh failed - clear auth but don't redirect
          // Let AuthGuard handle the redirect logic
          localStorage.removeItem("auth-token");
          localStorage.removeItem("refresh-token");
          localStorage.removeItem("auth-storage");
          // Don't auto-redirect - let the auth guard detect the missing token
        }
      }

      // ── Subscription-inactive 403 discrimination ──────────────────────────
      // When the backend rejects a request because the tenant's subscription has
      // lapsed it returns 403 with code=subscription_inactive (or upgrade=true).
      // This is NOT an auth failure — do NOT logout/redirect. Swallow it (with a
      // gentle toast) and let the dashboard <SubscriptionBanner> drive the UX.
      // The nested `detail.code` shape is also checked (FastAPI HTTPException).
      if (error.response?.status === 403) {
        const body = error.response?.data as
          | (ApiErrorResponse & {
              code?: string;
              upgrade?: boolean;
              detail?: { code?: string };
            })
          | undefined;
        const isSubscription403 =
          body?.code === 'subscription_inactive' ||
          body?.upgrade === true ||
          body?.error?.code === 'subscription_inactive' ||
          body?.detail?.code === 'subscription_inactive';

        if (isSubscription403) {
          if (typeof window !== 'undefined') {
            try {
              const { showToast } = await import('@/lib/utils/toast');
              showToast.error('An active subscription is required');
            } catch {
              // toast is best-effort
            }
          }
          // Reject quietly so callers can ignore it; no logout/redirect.
          return Promise.reject(error);
        }
      }

      // Transform error to ApiError
      if (error.response?.data?.error) {
        const { code, message, details, field_errors } = error.response.data.error;
        throw new ApiError(
          message,
          code,
          error.response.status,
          details,
          field_errors
        );
      }

      // FastAPI HTTPException shape: { detail: { code, message, ...extra } } or
      // { detail: "string" }. Preserve the structured detail (e.g. the captive
      // provider_subscription_inactive payload carries contact info the buy
      // page renders) by surfacing it as the ApiError code + details.
      const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
      if (detail && typeof detail === "object") {
        const d = detail as { code?: string; message?: string } & Record<string, unknown>;
        throw new ApiError(
          d.message || error.message || "Request failed",
          d.code || "ERROR",
          error.response?.status || 0,
          d
        );
      }

      // Generic error
      throw new ApiError(
        error.message || "An unexpected error occurred",
        "NETWORK_ERROR",
        error.response?.status || 0
      );
    }
  );

  return client;
}

// Export singleton instance
export const apiClient = createApiClient();

/**
 * Helper functions for common HTTP methods with typed responses
 */
export const api = {
  get: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  },
};

export default apiClient;
