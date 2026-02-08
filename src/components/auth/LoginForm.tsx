'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, type UserRole } from '@/lib/store/auth';
import { authLogger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

/**
 * Get the appropriate redirect URL based on user role
 * For customers, uses portal URL from login response (based on subscription type)
 */
function getRedirectByRole(role: UserRole | undefined, customerPortalUrl?: string): string {
  switch (role) {
    case 'superuser':
      // Platform owner goes to platform admin dashboard
      return '/platform';
    case 'admin':
    case 'technician':
      // ISP admin and technicians go to ISP dashboard
      return '/dashboard';
    case 'customer':
      // Customers go to their portal based on subscription type (hotspot/pppoe)
      // Portal URL is provided by backend based on their active subscription
      return customerPortalUrl || '/dashboard';
    default:
      return '/dashboard';
  }
}

export function LoginForm({ inline = false, onSubmit, initialUsername, initialPassword }: { inline?: boolean; onSubmit?: (username: string, password: string) => Promise<void> | void; initialUsername?: string; initialPassword?: string }) {
  const [username, setUsername] = useState(initialUsername ?? '');
  const [password, setPassword] = useState(initialPassword ?? '');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const totpInputRef = useRef<HTMLInputElement>(null);
  
  const { login, complete2FALogin, clear2FAChallenge, twoFactorChallenge, isLoading } = useAuthStore();
  const router = useRouter();

  // Focus TOTP input when 2FA challenge appears
  useEffect(() => {
    if (twoFactorChallenge && totpInputRef.current) {
      totpInputRef.current.focus();
    }
  }, [twoFactorChallenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (onSubmit) {
        await onSubmit(username, password);
        // Caller handles post-login navigation / token storage
      } else {
        await login(username, password);

        // Check if 2FA is required (twoFactorChallenge will be set in store)
        const state = useAuthStore.getState();
        if (state.twoFactorChallenge) {
          // 2FA required - stay on form, user will enter TOTP code
          return;
        }

        authLogger.info('[LoginForm] Login successful, waiting for persist...');

        // Wait for Zustand persist to save to localStorage before navigating
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify localStorage has the data
        const authStorage = localStorage.getItem('auth-storage');
        const authToken = localStorage.getItem('auth-token');

        authLogger.debug('[LoginForm] Pre-navigation localStorage check:', {
          hasAuthStorage: !!authStorage,
          hasAuthToken: !!authToken,
        });

        if (!authStorage || !authToken) {
          authLogger.error('[LoginForm] WARNING: localStorage not populated after login!');
          setError('Login state not saved. Please try again.');
          return;
        }

        // Get user role and customer portal info from the store to determine redirect
        const userRole = state.user?.role;
        const customerPortalUrl = state.customerPortalInfo?.portal_url;
        const redirectUrl = getRedirectByRole(userRole, customerPortalUrl);

        authLogger.debug('[LoginForm] Role-based redirect:', { userRole, customerPortalUrl, redirectUrl });

        // Use window.location for immediate navigation after login
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!twoFactorChallenge?.tempToken) {
      setError('Session expired. Please login again.');
      clear2FAChallenge();
      return;
    }

    try {
      await complete2FALogin(twoFactorChallenge.tempToken, totpCode);

      // Wait for Zustand persist
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get user role and redirect
      const state = useAuthStore.getState();
      const userRole = state.user?.role;
      const customerPortalUrl = state.customerPortalInfo?.portal_url;
      const redirectUrl = getRedirectByRole(userRole, customerPortalUrl);

      authLogger.info('[LoginForm] 2FA verified, redirecting:', { userRole, redirectUrl });

      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      setTotpCode('');
    }
  };

  const handleBack = () => {
    clear2FAChallenge();
    setTotpCode('');
    setError('');
  };

  // 2FA Verification UI
  if (twoFactorChallenge) {
    const twoFactorContent = (
      <>
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handle2FASubmit} className="space-y-4">
          <div>
            <Label htmlFor="totp-code" className="sr-only">Verification Code</Label>
            <Input
              ref={totpInputRef}
              id="totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={totpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                setTotpCode(value);
              }}
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Or enter a recovery code if you don&apos;t have access to your authenticator
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || totpCode.length < 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </form>
      </>
    );

    if (inline) {
      return <Card className="w-full max-w-md p-6">{twoFactorContent}</Card>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">{twoFactorContent}</Card>
      </div>
    );
  }

  // Regular Login UI
  const cardContent = (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username or Email</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="username"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="h-11"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </div>
      </form>
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

