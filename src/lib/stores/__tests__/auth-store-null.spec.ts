import { describe, expect, it } from 'vitest';
import { useAuthStore } from '../auth-store';

describe('auth store setUser defensive behavior', () => {
  it('allows setting user to null without throwing', () => {
    const store = useAuthStore.getState();

    // Ensure calling setUser(null) does not throw and clears user
    expect(() => store.setUser(null as any)).not.toThrow();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
