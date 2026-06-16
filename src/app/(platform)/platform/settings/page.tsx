'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Copy, CreditCard, Globe, Settings, Shield, AlertTriangle, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api-client';
import { config } from '@/lib/config';

interface PaymentGateway {
  id: number;
  gateway_type: string;
  name: string;
  is_active: boolean;
  is_primary: boolean;
  has_credentials: boolean;
}

interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: {
    balance?: number;
    currency?: string;
  };
}

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'domain', label: 'Domain', icon: Globe },
  { id: 'payments', label: 'Payment Options', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [activePaymentGateway, setActivePaymentGateway] = useState<'mpesa' | 'paystack'>('paystack');

  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackMode, setPaystackMode] = useState<'test' | 'live'>('test');

  // Paystack form state
  const [paystackGatewayId, setPaystackGatewayId] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('KES');
  const [paymentChannels, setPaymentChannels] = useState({
    card: true,
    bank: true,
    ussd: false,
    qr: false,
    mobile_money: true,
    bank_transfer: false,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Computed URLs based on current domain
  const getApiBaseUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    // Use environment variable if set, otherwise derive from current domain
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // For development (localhost:3000), assume API is on port 8000
    if (origin.includes('localhost:3000') || origin.includes('127.0.0.1:3000')) {
      return origin.replace(':3000', ':8000') + '/api/v1';
    }
    // For production, assume API is on the same domain with /api/v1 path
    return origin + '/api/v1';
  }, []);

  // Track if credentials are already saved
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);

  // Load existing Paystack configuration
  const loadPaystackConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use platform endpoint for platform-level payment gateways
      // Backend returns array directly, not wrapped in { data: ... }
      const response = await apiClient.get<PaymentGateway[]>('/platform/payment-gateways/');
      const gateways = response.data;

      // Find existing Paystack gateway
      const paystackGateway = gateways.find(g => g.gateway_type === 'paystack');
      if (paystackGateway) {
        setPaystackGatewayId(paystackGateway.id);
        setPaystackEnabled(paystackGateway.is_active);
        setHasExistingCredentials(paystackGateway.has_credentials);
        // Clear any previously entered credentials
        setPublicKey('');
        setSecretKey('');
        setWebhookSecret('');
      }
    } catch (error) {
      console.error('Failed to load Paystack config:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaystackConfig();
  }, [loadPaystackConfig]);

  // Save Paystack configuration
  const handleSavePaystack = async () => {
    // Validation with specific error messages
    if (!paystackEnabled) {
      toast.error('Please enable Paystack payments first (toggle at the top)');
      return;
    }

    // If no existing credentials and no gateway exists, require credentials
    if (!hasExistingCredentials && !paystackGatewayId) {
      if (!publicKey) {
        toast.error('Public Key is required');
        return;
      }
      if (!secretKey) {
        toast.error('Secret Key is required');
        return;
      }
    }

    try {
      setIsSaving(true);

      // Only include credentials if user entered new ones
      const credentials: Record<string, string> = {};
      if (publicKey) credentials.public_key = publicKey;
      if (secretKey) credentials.secret_key = secretKey;
      if (webhookSecret) credentials.webhook_secret = webhookSecret;

      if (paystackGatewayId) {
        // Update existing gateway - only send credentials if user entered new ones
        const updatePayload: Record<string, unknown> = {
          is_active: paystackEnabled,
        };
        if (Object.keys(credentials).length > 0) {
          updatePayload.credentials = credentials;
        }
        await apiClient.patch(`/platform/payment-gateways/${paystackGatewayId}`, updatePayload);
        toast.success('Paystack configuration updated successfully');
      } else {
        // Create new gateway (backend does upsert if exists)
        const response = await apiClient.post<PaymentGateway>('/platform/payment-gateways/', {
          gateway_type: 'paystack',
          name: 'Paystack',
          is_active: paystackEnabled,
          is_primary: true,
          credentials,
        });
        setPaystackGatewayId(response.data.id);
        setHasExistingCredentials(true);
        toast.success('Paystack configuration saved successfully');
      }
    } catch (error: unknown) {
      console.error('Failed to save Paystack config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Test Paystack connection
  const handleTestConnection = async () => {
    // Validation with specific error messages
    if (!paystackEnabled) {
      toast.error('Please enable Paystack payments first (toggle at the top)');
      return;
    }

    // Only require credentials if no existing credentials
    if (!hasExistingCredentials) {
      if (!publicKey) {
        toast.error('Please enter your Public Key');
        return;
      }
      if (!secretKey) {
        toast.error('Please enter your Secret Key');
        return;
      }
    }

    // Save first if no gateway exists
    if (!paystackGatewayId) {
      toast.info('Saving configuration before testing...');
      await handleSavePaystack();
    }

    // Check again after saving
    if (!paystackGatewayId) {
      toast.error('Please save configuration first');
      return;
    }

    try {
      setIsTesting(true);
      const response = await apiClient.post<TestConnectionResult>(`/platform/payment-gateways/${paystackGatewayId}/test`);

      if (response.data.success) {
        const details = response.data.details;
        if (details?.balance !== undefined) {
          toast.success(`Connection successful! Balance: ${details.currency} ${details.balance.toLocaleString()}`);
        } else {
          toast.success('Connection successful!');
        }
      } else {
        toast.error(response.data.message || 'Connection test failed');
      }
    } catch (error: unknown) {
      console.error('Connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      toast.error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">Configure your platform settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Card className="lg:w-64 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <Card className="flex-1 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-900">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                  <Input defaultValue="ISP Billing Platform" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <Input type="email" defaultValue="support@ispbilling.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Trial Days</label>
                  <Input type="number" defaultValue="14" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                  <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm">
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="TZS">TZS - Tanzanian Shilling</option>
                    <option value="UGX">UGX - Ugandan Shilling</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-brand-600 hover:bg-brand-700">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'domain' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-900">Domain Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portal Base Domain</label>
                  <Input defaultValue="portal.ispbilling.com" />
                  <p className="text-xs text-gray-500 mt-1">Organizations will be accessible at {'{slug}'}.portal.ispbilling.com</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Domain</label>
                  <Input defaultValue="api.ispbilling.com" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-brand-600 hover:bg-brand-700">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900">Payment Options</h2>
                <p className="text-sm text-gray-500">Configure payment gateways where all customer payments will be collected. ISPs will receive payouts from this pool.</p>
              </div>

              {/* Payment Gateway Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setActivePaymentGateway('mpesa')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activePaymentGateway === 'mpesa'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">M</span>
                  </div>
                  M-Pesa
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded">Soon</span>
                </button>
                <button
                  onClick={() => setActivePaymentGateway('paystack')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activePaymentGateway === 'paystack'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">P</span>
                  </div>
                  Paystack
                </button>
              </div>

              {/* M-Pesa Content - Coming Soon */}
              {activePaymentGateway === 'mpesa' && (
                <Card className="p-6 border-l-4 border-l-green-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xl">M</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">M-Pesa</div>
                      <p className="text-sm text-gray-500">Safaricom M-Pesa mobile money payments</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      We&apos;re working on integrating M-Pesa Daraja API for seamless mobile money payments.
                      This feature will be available in a future update.
                    </p>
                  </div>
                </Card>
              )}

              {/* Paystack Content - Full Configuration */}
              {activePaymentGateway === 'paystack' && (
              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">P</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Paystack</div>
                      <p className="text-sm text-gray-500">Accept payments via cards, bank transfers & mobile money</p>
                    </div>
                  </div>
                  {isLoading ? (
                    <Badge variant="outline" className="text-gray-400 border-gray-300">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Loading...
                    </Badge>
                  ) : (
                    <Badge variant="outline" className={paystackEnabled ? "text-green-600 border-green-300" : "text-gray-400 border-gray-300"}>
                      {paystackEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                  )}
                </div>

                {/* Enable Paystack Toggle - At the top */}
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <div>
                    <div className="font-medium text-gray-900">Enable Paystack Payments</div>
                    <p className="text-sm text-gray-500">Allow customers to pay via Paystack</p>
                  </div>
                  <Switch
                    checked={paystackEnabled}
                    onCheckedChange={setPaystackEnabled}
                  />
                </div>

                {/* All settings below - disabled when paystackEnabled is false */}
                <div className={`space-y-6 ${!paystackEnabled ? 'opacity-50 pointer-events-none' : ''}`}>

                  {/* Mode Toggles - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => paystackEnabled && setPaystackMode('test')}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paystackMode === 'test'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Test Mode</div>
                          <p className="text-xs text-gray-500 mt-1">Use sandbox credentials</p>
                        </div>
                        <Switch
                          checked={paystackMode === 'test'}
                          onCheckedChange={(checked) => checked && setPaystackMode('test')}
                        />
                      </div>
                      {paystackMode === 'test' && (
                        <p className="text-xs text-amber-600 mt-2">No real transactions will be processed</p>
                      )}
                    </div>
                    <div
                      onClick={() => paystackEnabled && setPaystackMode('live')}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paystackMode === 'live'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Live Mode</div>
                          <p className="text-xs text-gray-500 mt-1">Process real payments</p>
                        </div>
                        <Switch
                          checked={paystackMode === 'live'}
                          onCheckedChange={(checked) => checked && setPaystackMode('live')}
                        />
                      </div>
                      {paystackMode === 'live' && (
                        <p className="text-xs text-green-600 mt-2">Real transactions will be processed</p>
                      )}
                    </div>
                  </div>

                  {/* Default Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
                      disabled={!paystackEnabled}
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                    >
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="GHS">GHS - Ghanaian Cedi</option>
                      <option value="ZAR">ZAR - South African Rand</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>

                  {/* API Credentials Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">API Credentials</h3>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Security Notice</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Get your API keys from your{' '}
                            <a href="https://dashboard.paystack.com/#/settings/developers" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                              Paystack Dashboard <ExternalLink className="w-3 h-3" />
                            </a>
                            . All credentials are encrypted at rest.
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasExistingCredentials && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-800">
                            API credentials are configured. Leave fields unchanged to keep existing credentials.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Public Key {!hasExistingCredentials && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          placeholder={hasExistingCredentials ? '••••••••••••••••' : (paystackMode === 'test' ? 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx' : 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx')}
                          value={publicKey.includes('_saved') ? '' : publicKey}
                          onChange={(e) => setPublicKey(e.target.value)}
                          disabled={!paystackEnabled}
                          className={hasExistingCredentials && !publicKey ? 'bg-gray-50' : ''}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {hasExistingCredentials ? 'Leave empty to keep existing key' : 'Starts with pk_test_ or pk_live_'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Key {!hasExistingCredentials && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          type="password"
                          placeholder={hasExistingCredentials ? '••••••••••••••••' : 'Enter secret key'}
                          value={secretKey.includes('_saved') ? '' : secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          disabled={!paystackEnabled}
                          className={hasExistingCredentials && !secretKey ? 'bg-gray-50' : ''}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {hasExistingCredentials ? 'Leave empty to keep existing key' : 'Starts with sk_test_ or sk_live_'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                        <Input
                          type="password"
                          placeholder={hasExistingCredentials ? '••••••••••••••••' : 'Enter webhook secret'}
                          value={webhookSecret.includes('_saved') ? '' : webhookSecret}
                          onChange={(e) => setWebhookSecret(e.target.value)}
                          disabled={!paystackEnabled}
                          className={hasExistingCredentials && !webhookSecret ? 'bg-gray-50' : ''}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {hasExistingCredentials ? 'Leave empty to keep existing secret' : 'Used to verify webhook signatures from Paystack'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Channels */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Channels</h3>
                    <p className="text-sm text-gray-500 mb-4">Enabled Payment Methods - Choose which payment methods to show on the checkout page</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'card', label: 'Card' },
                        { id: 'bank', label: 'Bank Transfer' },
                        { id: 'ussd', label: 'USSD' },
                        { id: 'qr', label: 'QR Code' },
                        { id: 'mobile_money', label: 'Mobile Money' },
                        { id: 'bank_transfer', label: 'Bank Account' },
                      ].map((channel) => (
                        <label key={channel.id} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${!paystackEnabled ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={paymentChannels[channel.id as keyof typeof paymentChannels]}
                            onChange={(e) => setPaymentChannels(prev => ({ ...prev, [channel.id]: e.target.checked }))}
                            disabled={!paystackEnabled}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-sm">{channel.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* URL Configuration */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">URL Configuration</h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <p className="text-sm text-blue-800 font-medium mb-2">Auto-configured URLs (copy to Paystack Dashboard):</p>
                      <div className="space-y-2 text-xs text-blue-700">
                        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border">
                          <div className="flex items-center gap-2 min-w-0">
                            <Check className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">Callback: {typeof window !== 'undefined' ? window.location.origin : ''}/payment/callback</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/payment/callback`);
                              toast.success('Callback URL copied!');
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border">
                          <div className="flex items-center gap-2 min-w-0">
                            <Check className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">Webhook: {getApiBaseUrl()}/payments/paystack/webhook</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(`${getApiBaseUrl()}/payments/paystack/webhook`);
                              toast.success('Webhook URL copied!');
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
                        <Input
                          placeholder="https://yourdomain.com/payment/callback"
                          value={callbackUrl}
                          onChange={(e) => setCallbackUrl(e.target.value)}
                          disabled={!paystackEnabled}
                        />
                        <p className="text-xs text-gray-500 mt-1">URL to redirect customers after payment (leave empty for auto-config)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                        <Input
                          placeholder="https://yourdomain.com/api/paystack/webhook"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          disabled={!paystackEnabled}
                        />
                        <p className="text-xs text-gray-500 mt-1">URL for Paystack to send event notifications (leave empty for auto-config)</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Configure the webhook URL in your Paystack Dashboard to receive payment notifications.
                        URLs are automatically configured based on your server domain.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSavePaystack}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : paystackGatewayId ? (
                      'Update Configuration'
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                </div>
              </Card>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">
                  SMS, email and WhatsApp delivery is now centrally managed in the Notifications service.
                </p>
              </div>

              <Card className="p-6 border-l-4 border-l-brand-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Managed in the Notifications service</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        SMS/email/WhatsApp gateways, message templates, messaging credits and the
                        WhatsApp subscription are all configured in the centralized Notifications service.
                        These settings are no longer managed from the ISP billing platform.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button asChild className="bg-brand-600 hover:bg-brand-700">
                        <a
                          href={`${config.notificationsUiUrl}/billing/credits`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          Manage messaging credits &amp; subscription
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <a
                          href={config.notificationsUiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          Open Notifications service
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-900">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <Input type="number" defaultValue="60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                  <Input type="number" defaultValue="5" />
                </div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Require 2FA for platform admins</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Log all admin actions</span>
                </label>
              </div>
              <div className="flex justify-end">
                <Button className="bg-brand-600 hover:bg-brand-700">Save Changes</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
