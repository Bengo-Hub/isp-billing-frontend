import { describe, expect, it } from 'vitest';
import { transformPermissions } from '../RBACProvider';

describe('transformPermissions', () => {
  it('transforms grouped permissions to RBACPermission[]', () => {
    const input = [
      { module: 'billing', actions: ['read', 'write'] },
      { module: 'users', actions: ['create'] },
    ];

    const result = transformPermissions(input as any);

    // Expect 3 permission entries
    expect(result.length).toBe(3);

    const simplified = result.map((r) => ({ module: r.module, action: r.action }));

    expect(simplified).toEqual(
      expect.arrayContaining([
        { module: 'billing', action: 'read' },
        { module: 'billing', action: 'write' },
        { module: 'users', action: 'create' },
      ])
    );
  });

  it('transforms flat single-action permissions', () => {
    const input = [{ module: 'billing', action: 'read' }];
    const result = transformPermissions(input as any);
    expect(result.length).toBe(1);
    expect(result[0].module).toBe('billing');
    expect(result[0].action).toBe('read');
  });
});
