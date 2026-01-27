/**
 * React Query client configuration and query key factory
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Create and configure QueryClient with sensible defaults
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 1000 * 60 * 5,
        // Garbage collect after 10 minutes
        gcTime: 1000 * 60 * 10,
        // Don't refetch on window focus (can be overridden per query)
        refetchOnWindowFocus: false,
        // Retry once on failure
        retry: 1,
        // Retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Don't retry mutations by default
        retry: 0,
      },
    },
  });
}

// Singleton query client for use in app
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return createQueryClient();
  }

  // Browser: reuse client
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}

/**
 * Query key factory for type-safe cache invalidation
 *
 * Following the pattern from legal-system-ui for consistent query key management.
 * Each entity has its own factory with standard methods.
 */
export const queryKeys = {
  // Authentication
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Routers (MikroTik)
  routers: {
    all: ["routers"] as const,
    lists: () => [...queryKeys.routers.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.routers.lists(), filters] as const,
    details: () => [...queryKeys.routers.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.routers.details(), id] as const,
    status: (id: string) =>
      [...queryKeys.routers.detail(id), "status"] as const,
    devices: (id: string) =>
      [...queryKeys.routers.detail(id), "devices"] as const,
    users: (id: string) => [...queryKeys.routers.detail(id), "users"] as const,
  },

  // Packages/Plans
  packages: {
    all: ["packages"] as const,
    lists: () => [...queryKeys.packages.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.packages.lists(), filters] as const,
    details: () => [...queryKeys.packages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.packages.details(), id] as const,
    templates: () => [...queryKeys.packages.all, "templates"] as const,
  },

  // Subscriptions
  subscriptions: {
    all: ["subscriptions"] as const,
    lists: () => [...queryKeys.subscriptions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.subscriptions.lists(), filters] as const,
    details: () => [...queryKeys.subscriptions.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.subscriptions.details(), id] as const,
    byUser: (userId: string) =>
      [...queryKeys.subscriptions.all, "user", userId] as const,
  },

  // Billing & Invoices
  billing: {
    all: ["billing"] as const,
    invoices: {
      all: () => [...queryKeys.billing.all, "invoices"] as const,
      list: (filters?: Record<string, unknown>) =>
        [...queryKeys.billing.invoices.all(), "list", filters] as const,
      detail: (id: string) =>
        [...queryKeys.billing.invoices.all(), id] as const,
    },
    payments: {
      all: () => [...queryKeys.billing.all, "payments"] as const,
      list: (filters?: Record<string, unknown>) =>
        [...queryKeys.billing.payments.all(), "list", filters] as const,
      detail: (id: string) =>
        [...queryKeys.billing.payments.all(), id] as const,
    },
  },

  // SMS
  sms: {
    all: ["sms"] as const,
    balance: () => [...queryKeys.sms.all, "balance"] as const,
    history: (filters?: Record<string, unknown>) =>
      [...queryKeys.sms.all, "history", filters] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, "unread"] as const,
    tickets: {
      all: () => [...queryKeys.notifications.all, "tickets"] as const,
      list: (filters?: Record<string, unknown>) =>
        [...queryKeys.notifications.tickets.all(), "list", filters] as const,
      detail: (id: string) =>
        [...queryKeys.notifications.tickets.all(), id] as const,
    },
  },

  // Reports & Analytics
  reports: {
    all: ["reports"] as const,
    dashboard: () => [...queryKeys.reports.all, "dashboard"] as const,
    revenue: (period?: string) =>
      [...queryKeys.reports.all, "revenue", period] as const,
    users: (period?: string) =>
      [...queryKeys.reports.all, "users", period] as const,
    routers: (period?: string) =>
      [...queryKeys.reports.all, "routers", period] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    general: () => [...queryKeys.settings.all, "general"] as const,
    payment: () => [...queryKeys.settings.all, "payment"] as const,
    sms: () => [...queryKeys.settings.all, "sms"] as const,
    email: () => [...queryKeys.settings.all, "email"] as const,
  },

  // Licence
  licence: {
    all: ["licence"] as const,
    status: () => [...queryKeys.licence.all, "status"] as const,
    usage: () => [...queryKeys.licence.all, "usage"] as const,
  },

  // RBAC
  rbac: {
    all: ["rbac"] as const,
    roles: () => [...queryKeys.rbac.all, "roles"] as const,
    role: (id: string) => [...queryKeys.rbac.all, "role", id] as const,
    permissions: () => [...queryKeys.rbac.all, "permissions"] as const,
  },
};

export type QueryKeys = typeof queryKeys;
