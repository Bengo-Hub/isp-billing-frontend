'use client';

/**
 * Break-glass staff login.
 *
 * Admin authentication is fully migrated to the central Codevertex SSO. This
 * page is a discreet, KEPT fallback for the seeded superuser (break-glass) so
 * the platform can still be accessed if SSO is unavailable. It calls the local
 * `login()` action directly and then routes by role using the same logic as the
 * /auth/callback page.
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, type UserRole } from '@/lib/store/auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Same role-based redirect logic the /auth/callback page uses, kept in sync. */
function getRedirectByRole(
  role: UserRole | undefined,
  organizationSlug?: string,
): string {
  switch (role) {
    case 'superuser':
      return '/platform';
    case 'admin':
    case 'technician':
      return organizationSlug ? `/${organizationSlug}/dashboard` : '/login';
    default:
      return '/login';
  }
}

export default function StaffLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      const { user, organizationInfo } = useAuthStore.getState();
      const orgSlug = organizationInfo?.organization_slug || undefined;
      router.replace(getRedirectByRole(user?.role, orgSlug));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-700 mb-2">
            Staff login
          </h1>
          <p className="text-xs text-gray-400">
            Break-glass staff login — admins should use SSO
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
            Back to SSO login
          </Link>
        </p>
      </Card>
    </div>
  );
}
