'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, type UserRole } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const [username, setUsername] = useState(initialUsername ?? 'demoispadmin');
  const [password, setPassword] = useState(initialPassword ?? 'admin123');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  // Demo accounts for quick prefills
  const demoAccounts = {
    platformOwner: { username: 'platformadmin', password: 'admin123' },
    ispAdmin: { username: 'demoispadmin', password: 'admin123' },
    technician: { username: 'demoistech1', password: 'tech123' },
    customer: { username: 'democust1', password: 'cust123' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (onSubmit) {
        await onSubmit(username, password);
        // Caller handles post-login navigation / token storage
      } else {
        await login(username, password);

        console.log('[LoginForm] Login successful, waiting for persist...');

        // Wait for Zustand persist to save to localStorage before navigating
        // This prevents race condition where navigation happens before state is saved
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify localStorage has the data
        const authStorage = localStorage.getItem('auth-storage');
        const authToken = localStorage.getItem('auth-token');

        console.log('[LoginForm] Pre-navigation localStorage check:', {
          hasAuthStorage: !!authStorage,
          hasAuthToken: !!authToken,
          authStoragePreview: authStorage?.substring(0, 100),
        });

        if (!authStorage || !authToken) {
          console.error('[LoginForm] WARNING: localStorage not populated after login!');
          setError('Login state not saved. Please try again.');
          return;
        }

        // Get user role and customer portal info from the store to determine redirect
        const state = useAuthStore.getState();
        const userRole = state.user?.role;
        const customerPortalUrl = state.customerPortalInfo?.portal_url;
        const redirectUrl = getRedirectByRole(userRole, customerPortalUrl);

        console.log('[LoginForm] Role-based redirect:', { userRole, customerPortalUrl, redirectUrl });

        // Use window.location for immediate navigation after login
        // This forces a full page reload with the new auth state
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }; 

  const cardContent = (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Codevertex</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="mt-2 flex gap-2 text-sm">
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => { setUsername(demoAccounts.platformOwner.username); setPassword(demoAccounts.platformOwner.password); }}
            >
              Platform Owner
            </button>
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => { setUsername(demoAccounts.ispAdmin.username); setPassword(demoAccounts.ispAdmin.password); }}
            >
              ISP Admin
            </button>
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => { setUsername(demoAccounts.technician.username); setPassword(demoAccounts.technician.password); }}
            >
              Technician
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
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

