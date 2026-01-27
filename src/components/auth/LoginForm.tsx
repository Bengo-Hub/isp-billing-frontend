'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
        
        // Use window.location for immediate navigation after login
        // This forces a full page reload with the new auth state
        window.location.href = '/dashboard';
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

