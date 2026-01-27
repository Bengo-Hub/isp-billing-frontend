/**
 * API client re-exports for backward compatibility
 *
 * Existing code imports from '@/lib/api'
 * This file ensures those imports continue to work
 */

export { apiClient as api, apiClient, ApiError } from "./api-client";
export type { ApiResponse, ApiErrorResponse } from "./api-client";
