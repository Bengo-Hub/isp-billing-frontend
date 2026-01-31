/**
 * Re-export auth store from new location
 * This file exists for backward compatibility with imports from '@/lib/store/auth'
 */
export { useAuthStore } from "../stores/auth-store";
export type { User, Permission, UserRole } from "../stores/auth-store";
