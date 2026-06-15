'use client';

/**
 * Codevertex SSO callback (Phase 1c, ADDITIVE).
 *
 * Exchanges the authorization code for tokens, hydrates the local auth store
 * via the service /auth/me, then redirects to the role-appropriate dashboard.
 * This route is registered as PUBLIC in middleware.ts because the auth-token
 * cookie is only written here, after the exchange completes.
 *
 * The captive-portal / hotspot end-user login is unaffected — this only serves
 * platform + ISP-provider admin SSO sign-ins.
 */

import { useAuthStore, type UserRole } from '@/lib/store/auth';
import { consumeReturnTo, consumeState } from '@/lib/auth/sso';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

/** Same role-based redirect logic the local LoginForm uses, kept in sync. */
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

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');
  const ssoError = searchParams?.get('error');
  const returnedState = searchParams?.get('state');
  const completeSSOLogin = useAuthStore((s) => s.completeSSOLogin);
  const hasStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    if (ssoError) {
      setError(searchParams?.get('error_description') || ssoError);
      return;
    }
    if (!code) return;
    hasStarted.current = true;

    // CSRF guard: the returned `state` must match the value we stored before
    // the redirect. consumeState() also clears it.
    const expectedState = consumeState();
    if (expectedState && returnedState && expectedState !== returnedState) {
      setError('Sign-in could not be verified (state mismatch). Please try again.');
      return;
    }

    (async () => {
      try {
        const user = await completeSSOLogin(code);
        const returnTo = consumeReturnTo();
        const orgSlug =
          useAuthStore.getState().organizationInfo?.organization_slug || undefined;
        const target = returnTo || getRedirectByRole(user?.role, orgSlug);
        router.replace(target);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'SSO sign-in failed');
      }
    })();
  }, [code, ssoError, returnedState, completeSSOLogin, router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center p-8 border border-red-200 rounded-xl bg-red-50">
          <h1 className="text-xl font-bold text-red-700 mb-2">Sign-in Failed</h1>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-6 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-medium text-gray-800">Completing sign-in…</h1>
        <p className="text-gray-500 mt-1">Syncing your profile and permissions.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
