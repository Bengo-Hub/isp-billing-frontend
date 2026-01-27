'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, Copy, Download, Key, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function TwoFactorAuthPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<'setup' | 'verify' | 'recovery'>('setup');
  const [qrCode, setQrCode] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+');
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP');
  const [recoveryCodes] = useState([
    '12345678',
    '87654321', 
    '11223344',
    '44332211',
    '55667788',
    '88776655',
    '99887766',
    '66778899'
  ]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEnable = () => {
    setSetupStep('setup');
    // In real app, generate QR code and secret from backend
  };

  const handleVerify = () => {
    // In real app, verify code with backend
    setIsEnabled(true);
    setSetupStep('recovery');
  };

  const handleDisable = () => {
    setIsEnabled(false);
    setSetupStep('setup');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-pink-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600">Add an extra layer of security to your account</p>
        </div>
      </div>

      {!isEnabled ? (
        <Card className="p-6">
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
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 border border-gray-200 rounded-lg" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual entry key
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        value={secret} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(secret)}
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={() => setSetupStep('verify')} className="w-full">
                    I've added the account to my authenticator app
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
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleVerify} disabled={verificationCode.length !== 6}>
                  Verify and enable 2FA
                </Button>
                <Button variant="outline" onClick={() => setSetupStep('setup')}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 2FA Enabled Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication Enabled</h3>
                  <p className="text-gray-600">Your account is now protected with 2FA</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisable} className="text-red-600 border-red-300 hover:bg-red-50">
                Disable 2FA
              </Button>
            </div>
          </Card>

          {/* Recovery Codes */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Download className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Recovery Codes</h3>
                  <p className="text-gray-600 mt-1">
                    Save these recovery codes in a safe place. You can use them to access your account if you lose your device.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recoveryCodes.map((code, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-center font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadRecoveryCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Codes
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard(recoveryCodes.join('\n'))}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Codes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Security Tips */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
            Use a dedicated authenticator app like Google Authenticator or Authy
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
            Store your recovery codes in a secure location, separate from your device
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
            Never share your recovery codes or authenticator app codes with anyone
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
            If you lose access to your device, use recovery codes to regain access
          </li>
        </ul>
      </Card>
    </div>
  );
}
