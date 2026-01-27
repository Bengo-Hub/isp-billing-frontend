import { describe, expect, it } from 'vitest';
import { normalizePermissions } from '../auth-store';

describe('normalizePermissions', () => {
  it('normalizes flat per-action permissions', () => {
    const input = [
      { module: 'billing', action: 'read' },
      { module: 'billing', action: 'write' },
      { module: 'users', action: 'create' },
    ];

    const result = normalizePermissions(input as any);

    expect(result.length).toBe(2);

    const billing = result.find((r) => r.module === 'billing');
    const users = result.find((r) => r.module === 'users');

    expect(billing).toBeDefined();
    expect(new Set(billing!.actions)).toEqual(new Set(['read', 'write']));

    expect(users).toBeDefined();
    expect(users!.actions).toEqual(['create']);
  });

  it('normalizes grouped permissions', () => {
    const input = [
      { module: 'billing', actions: ['read', 'write'] },
      { module: 'users', actions: ['create'] },
    ];

    const result = normalizePermissions(input as any);

    expect(result.length).toBe(2);

    const billing = result.find((r) => r.module === 'billing');
    const users = result.find((r) => r.module === 'users');

    expect(billing).toBeDefined();
    expect(new Set(billing!.actions)).toEqual(new Set(['read', 'write']));

    expect(users).toBeDefined();
    expect(users!.actions).toEqual(['create']);
  });

  it('ignores invalid entries and returns empty for non-arrays', () => {
    expect(normalizePermissions(undefined as any)).toEqual([]);
    expect(normalizePermissions([ { foo: 'bar' } ] as any)).toEqual([]);
  });
});
