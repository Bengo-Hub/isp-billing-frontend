'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePortalConfig, usePPPoELogin } from '@/features/portal/api';
import { AlertTriangle, Loader2, Wifi } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PPPoELoginPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.org as string;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const loginMutation = usePPPoELogin(orgSlug);

  const primaryColor = config?.primary_color || '#801066';

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem(`pppoe_token_${orgSlug}`);
    if (savedToken) {
      router.push(`/portal/pppoe/${orgSlug}`);
    }
  }, [orgSlug, router]);

  // Save token and redirect on successful login
  useEffect(() => {
    if (loginMutation.data?.token) {
      localStorage.setItem(`pppoe_token_${orgSlug}`, loginMutation.data.token);
      router.push(`/portal/pppoe/${orgSlug}`);
    }
  }, [loginMutation.data, orgSlug, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
    } catch {
      // Error handled by mutation
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: `${primaryColor}10` }}>
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          {config?.logo_url && (
            <img src={config.logo_url} alt={config.organization_name} className="h-16 mx-auto mb-4" />
          )}
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
            <Wifi className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold">{config?.organization_name || 'Customer Portal'}</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your subscription</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {loginMutation.isError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Invalid username or password</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={!username || !password || loginMutation.isPending}
            className="w-full"
            style={{ backgroundColor: primaryColor }}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href={`mailto:${config?.email || 'support@example.com'}`}
              className="font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Contact support
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
