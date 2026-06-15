'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth';
import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

/**
 * ISP provider / admin login — SSO-only.
 *
 * Authentication for platform owners and ISP-provider admins is fully
 * decentralised to the central Codevertex SSO (auth-api). This service holds no
 * passwords: there is no local username/password form here. After the SSO
 * round-trip, the /auth/callback page exchanges the code, hydrates the profile +
 * service-level permissions from `/auth/me`, and routes by role.
 *
 * (The captive hotspot/PPPoE end-user portal is a separate, service-level flow
 * and is intentionally NOT affected by this component.)
 */
export function LoginForm({ inline = false }: { inline?: boolean }) {
  const [error, setError] = useState('');
  const [ssoLoading, setSsoLoading] = useState(false);
  const { startSSOLogin } = useAuthStore();

  const handleSSOLogin = async () => {
    setError('');
    setSsoLoading(true);
    try {
      // Preserve any ?redirect= target through the SSO round-trip.
      const redirect =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect') || undefined
          : undefined;
      await startSSOLogin(redirect);
      // startSSOLogin navigates away; keep the spinner until the browser leaves.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start SSO sign-in');
      setSsoLoading(false);
    }
  };

  const cardContent = (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-700 mb-3">
          Welcome back! Log in to your account
        </h1>
        <p className="text-sm text-gray-500">
          or{' '}
          <a href="/signup" className="text-pink-500 hover:text-pink-600 font-medium">
            sign up for an account
          </a>
        </p>
      </div>

      <Button
        type="button"
        onClick={handleSSOLogin}
        disabled={ssoLoading}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
      >
        {ssoLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to Codevertex…
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Sign in with Codevertex SSO
          </>
        )}
      </Button>

      {error && (
        <div className="mt-5 text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
        Secured by Codevertex SSO
      </p>
    </>
  );

  if (inline) {
    return <Card className="w-full max-w-md p-6">{cardContent}</Card>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">{cardContent}</Card>
    </div>
  );
}
