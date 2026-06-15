'use client';

/**
 * ISP-provider onboarding now runs through the CENTRAL Codevertex SSO
 * (accounts.codevertexitsolutions.com / auth-ui), NOT a local org-signup form.
 *
 * Rationale (Phase: SSO onboarding): tenants/users are owned by auth-api. The
 * SSO signup captures the ISP-specific fields (provider name, WhatsApp, licence,
 * coverage area) and tags the tenant with use_case "isp"/"hotspot" so auth-api
 * publishes auth.tenant.created, which this service's NATS consumer
 * (app/events/consumer.py: handle_auth_tenant) mirrors into a local Organization
 * and then auto-subscribes. A local org-signup here would bypass SSO entirely
 * (it created its own token + org), so it is RETIRED in favour of this redirect.
 *
 * Login remains dual-run (local password + "Sign in with Codevertex SSO") — only
 * the bypassing org-signup is redirected. After signing up + verifying in SSO,
 * users return here via "Sign in with Codevertex SSO" on /login (PKCE callback).
 */

import { config } from '@/lib/config';
import { SSO_BASE_URL } from '@/lib/auth/sso';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

/** Resolve the central accounts (auth-ui) signup URL. */
function getAccountsSignupUrl(): string {
  // Prefer the explicit accounts-UI base URL. Fall back to deriving the accounts
  // host from the SSO (auth-api) URL — same domain, `accounts` subdomain — and
  // finally to the known production accounts host.
  const explicit = (config.accountsUiUrl || '').replace(/\/$/, '');
  let base = explicit;
  if (!base) {
    try {
      const sso = new URL(SSO_BASE_URL);
      const host = sso.host.replace(/^sso\./, 'accounts.');
      base = `${sso.protocol}//${host}`;
    } catch {
      base = 'https://accounts.codevertexitsolutions.com';
    }
  }
  return `${base}/signup`;
}

export default function SignupRedirectPage() {
  const [accountsUrl, setAccountsUrl] = useState<string | null>(null);

  const fallbackUrl = useMemo(getAccountsSignupUrl, []);

  useEffect(() => {
    const url = getAccountsSignupUrl();
    setAccountsUrl(url);
    // Redirect to the central SSO/accounts signup.
    window.location.replace(url);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-md text-center space-y-4">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Redirecting you to Codevertex sign-up…
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ISP accounts are created through the secure Codevertex single sign-on.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Not redirected automatically?{' '}
          <a
            href={accountsUrl || fallbackUrl}
            className="font-medium text-primary hover:underline"
          >
            Continue to sign-up
          </a>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
