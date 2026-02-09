'use client';

/**
 * ConnectLoginModal – popup for returning captive-portal users.
 *
 * Flow:
 * 1. User enters username + password.
 * 2. Backend validates creds → checks active package/voucher.
 * 3a. Active → MikroTik sync → redirect to link-login URL → internet.
 * 3b. Expired / invalid → toast error.
 */

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHotspotLogin } from '@/features/portal/api';
import { showToast } from '@/lib/utils/toast';
import { AlertTriangle, Loader2, LogIn, Wifi } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ConnectLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  primaryColor: string;
  /** MikroTik link-login URL from the captive redirect query params. */
  linkLogin?: string | null;
  /** Client MAC address from the captive redirect query params. */
  macAddress?: string | null;
}

export function ConnectLoginModal({
  open,
  onOpenChange,
  orgSlug,
  primaryColor,
  linkLogin,
  macAddress,
}: ConnectLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useHotspotLogin(orgSlug);

  const resetForm = useCallback(() => {
    setUsername('');
    setPassword('');
    loginMutation.reset();
  }, [loginMutation]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) resetForm();
      onOpenChange(value);
    },
    [onOpenChange, resetForm],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      const result = await loginMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
        mac_address: macAddress || undefined,
      });

      if (result.success && result.is_active) {
        showToast.connected();

        // Redirect: prefer the backend-provided login_url, else the
        // MikroTik link-login from the captive redirect query string.
        const redirectUrl = result.login_url || linkLogin;
        if (redirectUrl) {
          // Small delay so the user sees the success toast
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 800);
        }

        handleClose(false);
      } else {
        // Backend responded but subscription is expired / invalid
        showToast.packageExpired();
      }
    } catch {
      // Network / 4xx / 5xx error — mutation state drives the inline alert.
      showToast.invalidCredentials();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] p-0">
        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-5 sm:mb-6 text-center">
            {/* Accent icon */}
            <div
              className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}18` }}
            >
              <Wifi className="w-7 h-7" style={{ color: primaryColor }} />
            </div>
            <DialogTitle className="text-lg sm:text-xl">
              Connect to Internet
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Enter your credentials to reconnect
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <Label htmlFor="connect-username" className="text-sm font-medium mb-1.5 block">
                Username
              </Label>
              <Input
                id="connect-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="h-11 sm:h-12 text-base"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="connect-password" className="text-sm font-medium mb-1.5 block">
                Password
              </Label>
              <Input
                id="connect-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-11 sm:h-12 text-base"
                required
              />
            </div>

            {/* Inline error */}
            {loginMutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Invalid username or password, or package expired.</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={!username.trim() || !password.trim() || loginMutation.isPending}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold touch-manipulation"
              style={{ backgroundColor: primaryColor }}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-4">
            Use the credentials you received after purchasing a package or voucher.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
