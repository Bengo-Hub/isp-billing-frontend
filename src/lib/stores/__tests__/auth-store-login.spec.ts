import { api } from '@/lib/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../auth-store';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('auth store login edge cases', () => {
  beforeEach(() => {
    // Clear store and localStorage
    useAuthStore.setState({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, isLoading: false, error: null });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not throw when login response lacks a user object', async () => {
    (api.post as unknown as vi.Mock).mockResolvedValue({ data: { access_token: 'token123', refresh_token: 'refresh123' } });

    await expect(useAuthStore.getState().login('foo', 'bar')).resolves.not.toThrow();

    // Tokens should be stored and user should be null
    expect(localStorage.getItem('auth-token')).toBe('token123');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});