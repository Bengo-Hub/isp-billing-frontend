'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    use2FAStatus,
    useDisable2FA,
    useRegenerateRecoveryCodes,
    useSetup2FA,
    useVerify2FA,
} from '@/features/auth/api';
import { CheckCircle, Copy, Download, Key, Loader2, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function TwoFactorAuthPage() {
  const { data: status, isLoading: statusLoading } = use2FAStatus();
  const setup2FA = useSetup2FA();
  const verify2FA = useVerify2FA();
  const disable2FA = useDisable2FA();
  const regenCodes = useRegenerateRecoveryCodes();

  const [setupStep, setSetupStep] = useState<'idle' | 'setup' | 'verify' | 'recovery'>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const isEnabled = status?.enabled ?? false;

  const handleStartSetup = () => {
    setup2FA.mutate(undefined, {
      onSuccess: (data) => {
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setSetupStep('setup');
      },
    });
  };

  const handleVerify = () => {
    verify2FA.mutate(
      { code: verificationCode },
      {
        onSuccess: (data) => {
          setRecoveryCodes(data.recovery_codes);
          setSetupStep('recovery');
          setVerificationCode('');
        },
      },
    );
  };

  const handleDisable = () => {
    disable2FA.mutate(
      { password: disablePassword },
      {
        onSuccess: () => {
          setShowDisableConfirm(false);
          setDisablePassword('');
          setSetupStep('idle');
          setRecoveryCodes([]);
        },
      },
    );
  };

  const handleRegenerateCodes = () => {
    regenCodes.mutate(undefined, {
      onSuccess: (data) => {
        setRecoveryCodes(data.recovery_codes);
      },
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  const downloadRecoveryCodes = () => {
    const content = recoveryCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-brand-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600">Add an extra layer of security to your account</p>
        </div>
      </div>

      {/* Setup Flow (not enabled yet) */}
      {!isEnabled && setupStep !== 'recovery' && (
        <Card className="p-6">
          {setupStep === 'idle' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Two-Factor Authentication is Disabled
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Protect your account by enabling two-factor authentication. You&apos;ll need to
                    enter a code from your authenticator app each time you sign in.
                  </p>
                </div>
              </div>
              <Button onClick={handleStartSetup} disabled={setup2FA.isPending}>
                {setup2FA.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set Up Two-Factor Authentication
              </Button>
            </div>
          )}

          {setupStep === 'setup' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Set up authenticator app</h3>
                  <p className="text-gray-600 mt-1">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-48 h-48 border border-gray-200 rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual entry key
                    </label>
                    <div className="flex gap-2">
                      <Input value={secret} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(secret)}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={() => setSetupStep('verify')} className="w-full">
                    I&apos;ve added the account to my authenticator app
                  </Button>
                </div>
              </div>
            </div>
          )}

          {setupStep === 'verify' && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Key className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Verify setup</h3>
                  <p className="text-gray-600 mt-1">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>

              <div className="max-w-xs">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || verify2FA.isPending}
                >
                  {verify2FA.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify and enable 2FA
                </Button>
                <Button variant="outline" onClick={() => setSetupStep('setup')}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Enabled State / Recovery Codes */}
      {(isEnabled || setupStep === 'recovery') && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Two-Factor Authentication Enabled
                  </h3>
                  <p className="text-gray-600">Your account is protected with 2FA</p>
                </div>
              </div>
              {!showDisableConfirm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDisableConfirm(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Disable 2FA
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-48"
                  />
                  <Button
                    variant="destructive"
                    onClick={handleDisable}
                    disabled={!disablePassword || disable2FA.isPending}
                    size="sm"
                  >
                    {disable2FA.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDisableConfirm(false);
                      setDisablePassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {recoveryCodes.length > 0 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Download className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Recovery Codes</h3>
                    <p className="text-gray-600 mt-1">
                      Save these recovery codes in a safe place. You can use them to access your
                      account if you lose your device.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recoveryCodes.map((code, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-center font-mono text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button variant="outline" onClick={downloadRecoveryCodes}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(recoveryCodes.join('\n'))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Codes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {isEnabled && recoveryCodes.length === 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Recovery Codes</h3>
                  <p className="text-sm text-gray-600">
                    Generate new recovery codes if you&apos;ve lost the previous ones.
                  </p>
                </div>
                <Button variant="outline" onClick={handleRegenerateCodes} disabled={regenCodes.isPending}>
                  {regenCodes.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Regenerate Codes
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Security Tips */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
            Use a dedicated authenticator app like Google Authenticator or Authy
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
            Store your recovery codes in a secure location, separate from your device
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
            Never share your recovery codes or authenticator app codes with anyone
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
            If you lose access to your device, use recovery codes to regain access
          </li>
        </ul>
      </Card>
    </div>
  );
}