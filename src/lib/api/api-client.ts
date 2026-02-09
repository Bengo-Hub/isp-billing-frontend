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
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const TIMEOUT = 30000;

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

      // Handle 401 Unauthorized - try token refresh (only in browser)
      if (
        typeof window !== "undefined" &&
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

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
