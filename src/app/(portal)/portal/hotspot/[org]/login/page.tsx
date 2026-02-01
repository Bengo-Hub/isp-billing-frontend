'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePortalConfig } from '@/features/portal/api';
import { AlertTriangle, Loader2, Wifi } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HotspotLoginPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.org as string;

  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);

  const primaryColor = config?.primary_color || '#ec4899';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Store voucher code and redirect to dashboard
      localStorage.setItem(`hotspot_voucher_${orgSlug}`, voucherCode);
      router.push(`/portal/hotspot/${orgSlug}`);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold">{config?.organization_name || 'Hotspot Portal'}</h1>
          <p className="text-gray-600 mt-2">Sign in with your voucher code</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher Code
            </label>
            <Input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Enter your voucher code"
              className="text-center text-lg font-mono"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={!voucherCode || isLoading}
            className="w-full"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
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
            Don't have a voucher?{' '}
            <button
              onClick={() => router.push(`/buy/${orgSlug}`)}
              className="font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Buy a package
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
