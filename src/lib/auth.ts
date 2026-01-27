import { useCallback } from "react";
import { useAuthStore } from "./store/auth";

/**
 * Backwards-compatible auth helper used by components.
 * Provides a small, convenient API on top of the Zustand store.
 */
export const useAuth = () => {
  const rawUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasRole = useAuthStore((s) => s.hasRole);

  // Provide a friendly `name` field for legacy consumers (e.g., `user.name`)
  const user = rawUser
    ? {
        ...rawUser,
        name:
          rawUser.first_name || rawUser.last_name
            ? `${rawUser.first_name || ''} ${rawUser.last_name || ''}`.trim()
            : rawUser.username,
      }
    : null;

  // Memoize actions where useful
  const doLogout = useCallback(() => {
    logout();
  }, [logout]);

  const doCheckAuth = useCallback(() => {
    return checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: doLogout,
    checkAuth: doCheckAuth,
    hasPermission,
    hasRole,
  } as const;
};
