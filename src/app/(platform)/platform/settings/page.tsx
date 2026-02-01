'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Copy, CreditCard, Globe, Mail, Plug, Settings, Shield, AlertTriangle, ExternalLink, Check, Loader2, DollarSign, MessageCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api-client';
import { useWhatsAppGateway, useSaveWhatsAppGateway, useTestWhatsAppGateway, useDeleteWhatsAppGateway, useWhatsAppAnalytics, useWhatsAppSubscriptions } from '@/features/platform/whatsapp-api';
import { WhatsAppPricingSettings } from '@/components/platform/WhatsAppPricingSettings';

interface PaymentGateway {
  id: number;
  gateway_type: string;
  name: string;
  is_active: boolean;
  is_primary: boolean;
  has_credentials: boolean;
}

interface SMSGateway {
  id: number;
  provider_type: string;
  name: string;
  is_active: boolean;
  is_primary: boolean;
  environment: string;
  has_credentials: boolean;
  status: string;
  last_error?: string;
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
  { id: 'sms', label: 'Notification Options', icon: Plug },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [activePaymentGateway, setActivePaymentGateway] = useState<'mpesa' | 'paystack'>('paystack');
  const [activeSmsProvider, setActiveSmsProvider] = useState<'twilio' | 'africastalking' | 'whatsapp' | 'pricing' | 'whatsapp-pricing'>('twilio');

  // SMS Pricing & Payment Settings state
  const [smsCostPerUnit, setSmsCostPerUnit] = useState('0.50');
  const [smsMinTopUp, setSmsMinTopUp] = useState('100');
  const [smsPaymentMethod, setSmsPaymentMethod] = useState<'mpesa' | 'bank' | 'paystack'>('paystack');
  const [smsMpesaPaybill, setSmsMpesaPaybill] = useState('');
  const [smsMpesaTill, setSmsMpesaTill] = useState('');
  const [smsMpesaAccountName, setSmsMpesaAccountName] = useState('');
  const [smsBankName, setSmsBankName] = useState('');
  const [smsBankAccountNumber, setSmsBankAccountNumber] = useState('');
  const [smsBankBranch, setSmsBankBranch] = useState('');
  const [isSavingSmsPricing, setIsSavingSmsPricing] = useState(false);
  const [isLoadingSmsPricing, setIsLoadingSmsPricing] = useState(false);
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackMode, setPaystackMode] = useState<'test' | 'live'>('test');

  // Twilio state
  const [twilioGatewayId, setTwilioGatewayId] = useState<number | null>(null);
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const [twilioMode, setTwilioMode] = useState<'test' | 'live'>('test');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  const [isSavingTwilio, setIsSavingTwilio] = useState(false);
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);
  const [hasExistingTwilioCredentials, setHasExistingTwilioCredentials] = useState(false);
  const [isLoadingTwilio, setIsLoadingTwilio] = useState(false);

  // Africa's Talking state
  const [atGatewayId, setAtGatewayId] = useState<number | null>(null);
  const [atEnabled, setAtEnabled] = useState(false);
  const [atMode, setAtMode] = useState<'sandbox' | 'live'>('sandbox');
  const [atUsername, setAtUsername] = useState('');
  const [atApiKey, setAtApiKey] = useState('');
  const [atSenderId, setAtSenderId] = useState('');
  const [isSavingAt, setIsSavingAt] = useState(false);
  const [isTestingAt, setIsTestingAt] = useState(false);
  const [hasExistingAtCredentials, setHasExistingAtCredentials] = useState(false);
  const [isLoadingAt, setIsLoadingAt] = useState(false);

  // WhatsApp (APIWAP) state
  const [whatsappGatewayId, setWhatsappGatewayId] = useState<number | null>(null);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState<'sandbox' | 'production'>('production');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [whatsappWebhookUrl, setWhatsappWebhookUrl] = useState('');
  const [whatsappTestPhone, setWhatsappTestPhone] = useState('');
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);
  const [hasExistingWhatsappCredentials, setHasExistingWhatsappCredentials] = useState(false);
  const [isLoadingWhatsapp, setIsLoadingWhatsapp] = useState(false);

  // WhatsApp API hooks
  const { data: whatsappGateway, isLoading: isLoadingWhatsappGateway } = useWhatsAppGateway();
  const saveWhatsappGateway = useSaveWhatsAppGateway();
  const testWhatsappGateway = useTestWhatsAppGateway();
  const deleteWhatsappGateway = useDeleteWhatsAppGateway();
  const { data: whatsappAnalytics } = useWhatsAppAnalytics();
  const { data: whatsappSubscriptions } = useWhatsAppSubscriptions();

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

  // Load existing SMS gateway configurations
  const loadSmsGatewayConfigs = useCallback(async () => {
    try {
      setIsLoadingTwilio(true);
      setIsLoadingAt(true);
      const response = await apiClient.get<SMSGateway[]>('/platform/sms-gateways/');
      const gateways = response.data;

      // Find Twilio gateway
      const twilioGateway = gateways.find(g => g.provider_type === 'twilio');
      if (twilioGateway) {
        setTwilioGatewayId(twilioGateway.id);
        setTwilioEnabled(twilioGateway.is_active);
        setTwilioMode(twilioGateway.environment === 'sandbox' ? 'test' : 'live');
        setHasExistingTwilioCredentials(twilioGateway.has_credentials);
        // Clear any previously entered credentials
        setTwilioAccountSid('');
        setTwilioAuthToken('');
        setTwilioPhoneNumber('');
      }

      // Find Africa's Talking gateway
      const atGateway = gateways.find(g => g.provider_type === 'africastalking');
      if (atGateway) {
        setAtGatewayId(atGateway.id);
        setAtEnabled(atGateway.is_active);
        setAtMode(atGateway.environment === 'sandbox' ? 'sandbox' : 'live');
        setHasExistingAtCredentials(atGateway.has_credentials);
        // Clear any previously entered credentials
        setAtUsername('');
        setAtApiKey('');
        setAtSenderId('');
      }
    } catch (error) {
      console.error('Failed to load SMS gateway configs:', error);
    } finally {
      setIsLoadingTwilio(false);
      setIsLoadingAt(false);
    }
  }, []);

  // Load SMS Pricing Settings
  const loadSmsPricingSettings = useCallback(async () => {
    try {
      setIsLoadingSmsPricing(true);
      const response = await apiClient.get<{
        cost_per_sms: number;
        minimum_top_up_amount: number;
        payment_method: string;
        mpesa_paybill: string | null;
        mpesa_till_number: string | null;
        mpesa_account_name: string | null;
        bank_name: string | null;
        bank_account_number: string | null;
        bank_branch: string | null;
      }>('/platform/sms-gateways/settings/pricing');
      const data = response.data;

      setSmsCostPerUnit(data.cost_per_sms?.toString() || '0.50');
      setSmsMinTopUp(data.minimum_top_up_amount?.toString() || '100');
      setSmsPaymentMethod((data.payment_method as 'mpesa' | 'bank' | 'paystack') || 'paystack');
      setSmsMpesaPaybill(data.mpesa_paybill || '');
      setSmsMpesaTill(data.mpesa_till_number || '');
      setSmsMpesaAccountName(data.mpesa_account_name || '');
      setSmsBankName(data.bank_name || '');
      setSmsBankAccountNumber(data.bank_account_number || '');
      setSmsBankBranch(data.bank_branch || '');
    } catch (error) {
      console.error('Failed to load SMS pricing settings:', error);
    } finally {
      setIsLoadingSmsPricing(false);
    }
  }, []);

  // Save SMS Pricing Settings
  const handleSaveSmsPricing = async () => {
    try {
      setIsSavingSmsPricing(true);
      await apiClient.post('/platform/sms-gateways/settings/pricing', {
        cost_per_sms: parseFloat(smsCostPerUnit) || 0.50,
        minimum_top_up_amount: parseFloat(smsMinTopUp) || 100,
        payment_method: smsPaymentMethod,
        mpesa_paybill: smsMpesaPaybill || null,
        mpesa_till_number: smsMpesaTill || null,
        mpesa_account_name: smsMpesaAccountName || null,
        bank_name: smsBankName || null,
        bank_account_number: smsBankAccountNumber || null,
        bank_branch: smsBankBranch || null,
      });
      toast.success('SMS pricing settings saved successfully');
    } catch (error: unknown) {
      console.error('Failed to save SMS pricing settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setIsSavingSmsPricing(false);
    }
  };

  useEffect(() => {
    loadPaystackConfig();
    loadSmsGatewayConfigs();
    loadSmsPricingSettings();
  }, [loadPaystackConfig, loadSmsGatewayConfigs, loadSmsPricingSettings]);

  // Load WhatsApp gateway configuration
  useEffect(() => {
    if (whatsappGateway) {
      setWhatsappGatewayId(whatsappGateway.id);
      setWhatsappEnabled(whatsappGateway.is_active);
      setWhatsappMode(whatsappGateway.environment as 'sandbox' | 'production');
      setWhatsappWebhookUrl(whatsappGateway.webhook_url || '');
      setHasExistingWhatsappCredentials(whatsappGateway.has_credentials);
    }
  }, [whatsappGateway]);

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

  // Save Twilio configuration
  const handleSaveTwilio = async () => {
    if (!twilioEnabled) {
      toast.error('Please enable Twilio SMS first');
      return;
    }

    // Require credentials if no existing credentials
    if (!hasExistingTwilioCredentials && !twilioGatewayId) {
      if (!twilioAccountSid) {
        toast.error('Account SID is required');
        return;
      }
      if (!twilioAuthToken) {
        toast.error('Auth Token is required');
        return;
      }
      if (!twilioPhoneNumber) {
        toast.error('Phone Number is required');
        return;
      }
    }

    try {
      setIsSavingTwilio(true);

      const credentials: Record<string, string> = {};
      if (twilioAccountSid) credentials.account_sid = twilioAccountSid;
      if (twilioAuthToken) credentials.auth_token = twilioAuthToken;
      if (twilioPhoneNumber) credentials.from_number = twilioPhoneNumber;

      const payload = {
        provider_type: 'twilio',
        name: 'Twilio SMS',
        is_active: twilioEnabled,
        is_primary: true,
        environment: twilioMode === 'test' ? 'sandbox' : 'production',
        credentials,
      };

      if (twilioGatewayId) {
        // Update existing
        await apiClient.patch(`/platform/sms-gateways/${twilioGatewayId}`, payload);
        toast.success('Twilio configuration updated');
      } else {
        // Create new (upsert)
        const response = await apiClient.post<SMSGateway>('/platform/sms-gateways/', payload);
        setTwilioGatewayId(response.data.id);
        setHasExistingTwilioCredentials(true);
        toast.success('Twilio configuration saved');
      }
    } catch (error: unknown) {
      console.error('Failed to save Twilio config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setIsSavingTwilio(false);
    }
  };

  // Test Twilio connection
  const handleTestTwilio = async () => {
    if (!twilioEnabled) {
      toast.error('Please enable Twilio SMS first');
      return;
    }

    if (!hasExistingTwilioCredentials && !twilioGatewayId) {
      if (!twilioAccountSid || !twilioAuthToken) {
        toast.error('Please enter credentials first');
        return;
      }
    }

    // Save first if no gateway exists
    if (!twilioGatewayId) {
      toast.info('Saving configuration before testing...');
      await handleSaveTwilio();
    }

    if (!twilioGatewayId) {
      toast.error('Please save configuration first');
      return;
    }

    try {
      setIsTestingTwilio(true);
      const response = await apiClient.post<TestConnectionResult>(`/platform/sms-gateways/${twilioGatewayId}/test`);

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
      console.error('Twilio test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      toast.error(errorMessage);
    } finally {
      setIsTestingTwilio(false);
    }
  };

  // Save Africa's Talking configuration
  const handleSaveAt = async () => {
    if (!atEnabled) {
      toast.error("Please enable Africa's Talking SMS first");
      return;
    }

    // Require credentials if no existing credentials
    if (!hasExistingAtCredentials && !atGatewayId) {
      if (!atUsername) {
        toast.error('Username is required');
        return;
      }
      if (!atApiKey) {
        toast.error('API Key is required');
        return;
      }
    }

    try {
      setIsSavingAt(true);

      const credentials: Record<string, string> = {};
      if (atUsername) credentials.username = atUsername;
      if (atApiKey) credentials.api_key = atApiKey;
      if (atSenderId) credentials.sender_id = atSenderId;

      const payload = {
        provider_type: 'africastalking',
        name: "Africa's Talking SMS",
        is_active: atEnabled,
        is_primary: false,
        environment: atMode === 'sandbox' ? 'sandbox' : 'production',
        credentials,
      };

      if (atGatewayId) {
        // Update existing
        await apiClient.patch(`/platform/sms-gateways/${atGatewayId}`, payload);
        toast.success("Africa's Talking configuration updated");
      } else {
        // Create new (upsert)
        const response = await apiClient.post<SMSGateway>('/platform/sms-gateways/', payload);
        setAtGatewayId(response.data.id);
        setHasExistingAtCredentials(true);
        toast.success("Africa's Talking configuration saved");
      }
    } catch (error: unknown) {
      console.error("Failed to save Africa's Talking config:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setIsSavingAt(false);
    }
  };

  // Test Africa's Talking connection
  const handleTestAt = async () => {
    if (!atEnabled) {
      toast.error("Please enable Africa's Talking SMS first");
      return;
    }

    if (!hasExistingAtCredentials && !atGatewayId) {
      if (!atUsername || !atApiKey) {
        toast.error('Please enter credentials first');
        return;
      }
    }

    // Save first if no gateway exists
    if (!atGatewayId) {
      toast.info('Saving configuration before testing...');
      await handleSaveAt();
    }

    if (!atGatewayId) {
      toast.error('Please save configuration first');
      return;
    }

    try {
      setIsTestingAt(true);
      const response = await apiClient.post<TestConnectionResult>(`/platform/sms-gateways/${atGatewayId}/test`);

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
      console.error("Africa's Talking test failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      toast.error(errorMessage);
    } finally {
      setIsTestingAt(false);
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
                      ? 'bg-pink-50 text-pink-600'
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
                <Button className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
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
                <Button className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900">Notification Options</h2>
                <p className="text-sm text-gray-500">Configure SMS providers for notifications across all tenants</p>
              </div>

              {/* SMS Provider Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setActiveSmsProvider('twilio')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSmsProvider === 'twilio'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">T</span>
                  </div>
                  Twilio
                </button>
                <button
                  onClick={() => setActiveSmsProvider('africastalking')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSmsProvider === 'africastalking'
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-xs">AT</span>
                  </div>
                  Africa&apos;s Talking
                </button>
                <button
                  onClick={() => setActiveSmsProvider('whatsapp')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSmsProvider === 'whatsapp'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-green-600" />
                  </div>
                  WhatsApp
                </button>
                <button
                  onClick={() => setActiveSmsProvider('pricing')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSmsProvider === 'pricing'
                      ? 'border-pink-600 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center">
                    <CreditCard className="w-3 h-3 text-pink-600" />
                  </div>
                  SMS Pricing & Payments
                </button>
                <button
                  onClick={() => setActiveSmsProvider('whatsapp-pricing')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSmsProvider === 'whatsapp-pricing'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-green-600" />
                  </div>
                  WhatsApp Pricing & Payments
                </button>
              </div>

              {/* Twilio Configuration */}
              {activeSmsProvider === 'twilio' && (
                <Card className="p-6 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">T</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Twilio</div>
                        <p className="text-sm text-gray-500">Global SMS provider with programmable messaging</p>
                      </div>
                    </div>
                    {isLoadingTwilio ? (
                      <Badge variant="outline" className="text-gray-400 border-gray-300">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={twilioEnabled ? "text-green-600 border-green-300" : "text-gray-400 border-gray-300"}>
                        {twilioEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    )}
                  </div>

                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                    <div>
                      <div className="font-medium text-gray-900">Enable Twilio SMS</div>
                      <p className="text-sm text-gray-500">Send notifications via Twilio</p>
                    </div>
                    <Switch
                      checked={twilioEnabled}
                      onCheckedChange={setTwilioEnabled}
                    />
                  </div>

                  <div className={`space-y-6 ${!twilioEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Mode Toggles - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => twilioEnabled && setTwilioMode('test')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          twilioMode === 'test'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Test Mode</div>
                            <p className="text-xs text-gray-500 mt-1">Use test credentials</p>
                          </div>
                          <Switch
                            checked={twilioMode === 'test'}
                            onCheckedChange={(checked) => checked && setTwilioMode('test')}
                          />
                        </div>
                        {twilioMode === 'test' && (
                          <p className="text-xs text-amber-600 mt-2">SMS will be logged but not sent</p>
                        )}
                      </div>
                      <div
                        onClick={() => twilioEnabled && setTwilioMode('live')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          twilioMode === 'live'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Live Mode</div>
                            <p className="text-xs text-gray-500 mt-1">Send real SMS messages</p>
                          </div>
                          <Switch
                            checked={twilioMode === 'live'}
                            onCheckedChange={(checked) => checked && setTwilioMode('live')}
                          />
                        </div>
                        {twilioMode === 'live' && (
                          <p className="text-xs text-green-600 mt-2">Real SMS will be sent</p>
                        )}
                      </div>
                    </div>

                    {/* API Credentials */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">API Credentials</h3>
                      </div>
                      <div className={`p-4 border rounded-lg mb-4 ${twilioMode === 'test' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex gap-2">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${twilioMode === 'test' ? 'text-amber-600' : 'text-blue-600'}`} />
                          <div>
                            <p className={`text-sm font-medium ${twilioMode === 'test' ? 'text-amber-800' : 'text-blue-800'}`}>
                              {twilioMode === 'test' ? 'Test Credentials' : 'Live Credentials'}
                            </p>
                            <p className={`text-xs mt-1 ${twilioMode === 'test' ? 'text-amber-700' : 'text-blue-700'}`}>
                              {twilioMode === 'test' ? (
                                <>
                                  Find your test credentials in{' '}
                                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                                    Twilio Console <ExternalLink className="w-3 h-3" />
                                  </a>
                                  {' '}under Account &gt; API keys &gt; Test Credentials. No charges will be made.
                                </>
                              ) : (
                                <>
                                  Get your live credentials from{' '}
                                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                                    Twilio Console <ExternalLink className="w-3 h-3" />
                                  </a>
                                  . Real SMS will be sent and charges will apply.
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {hasExistingTwilioCredentials && (
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
                            {twilioMode === 'test' ? 'Test Account SID' : 'Account SID'} {!hasExistingTwilioCredentials && <span className="text-red-500">*</span>}
                          </label>
                          <Input
                            placeholder={hasExistingTwilioCredentials ? '••••••••••••••••' : 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                            value={twilioAccountSid}
                            onChange={(e) => setTwilioAccountSid(e.target.value)}
                            disabled={!twilioEnabled}
                          />
                          {twilioMode === 'test' && (
                            <p className="text-xs text-amber-600 mt-1">Use your Test Account SID from Twilio Console</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {twilioMode === 'test' ? 'Test Auth Token' : 'Auth Token'} {!hasExistingTwilioCredentials && <span className="text-red-500">*</span>}
                          </label>
                          <Input
                            type="password"
                            placeholder={hasExistingTwilioCredentials ? '••••••••••••••••' : 'Enter auth token'}
                            value={twilioAuthToken}
                            onChange={(e) => setTwilioAuthToken(e.target.value)}
                            disabled={!twilioEnabled}
                          />
                          {twilioMode === 'test' && (
                            <p className="text-xs text-amber-600 mt-1">Use your Test Auth Token from Twilio Console</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (From) {!hasExistingTwilioCredentials && <span className="text-red-500">*</span>}
                          </label>
                          <Input
                            placeholder={hasExistingTwilioCredentials ? '••••••••••••••••' : (twilioMode === 'test' ? '+15005550006' : '+1234567890')}
                            value={twilioPhoneNumber}
                            onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                            disabled={!twilioEnabled}
                          />
                          {twilioMode === 'test' ? (
                            <p className="text-xs text-amber-600 mt-1">
                              Use Twilio magic number <code className="bg-amber-100 px-1 rounded">+15005550006</code> for testing
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1">
                              Your purchased Twilio phone number in E.164 format (e.g., +254712345678)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handleTestTwilio}
                      disabled={isTestingTwilio || !twilioEnabled}
                    >
                      {isTestingTwilio ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleSaveTwilio}
                      disabled={isSavingTwilio || !twilioEnabled}
                    >
                      {isSavingTwilio ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : twilioGatewayId ? (
                        'Update Configuration'
                      ) : (
                        'Save Configuration'
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Africa's Talking Configuration */}
              {activeSmsProvider === 'africastalking' && (
                <Card className="p-6 border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-lg">AT</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Africa&apos;s Talking</div>
                        <p className="text-sm text-gray-500">African-focused SMS & communications platform</p>
                      </div>
                    </div>
                    {isLoadingAt ? (
                      <Badge variant="outline" className="text-gray-400 border-gray-300">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={atEnabled ? "text-green-600 border-green-300" : "text-gray-400 border-gray-300"}>
                        {atEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    )}
                  </div>

                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
                    <div>
                      <div className="font-medium text-gray-900">Enable Africa&apos;s Talking SMS</div>
                      <p className="text-sm text-gray-500">Send notifications via Africa&apos;s Talking</p>
                    </div>
                    <Switch
                      checked={atEnabled}
                      onCheckedChange={setAtEnabled}
                    />
                  </div>

                  <div className={`space-y-6 ${!atEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Mode Toggles - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => atEnabled && setAtMode('sandbox')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          atMode === 'sandbox'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Sandbox Mode</div>
                            <p className="text-xs text-gray-500 mt-1">Use sandbox credentials</p>
                          </div>
                          <Switch
                            checked={atMode === 'sandbox'}
                            onCheckedChange={(checked) => checked && setAtMode('sandbox')}
                          />
                        </div>
                        {atMode === 'sandbox' && (
                          <p className="text-xs text-amber-600 mt-2">SMS will be simulated</p>
                        )}
                      </div>
                      <div
                        onClick={() => atEnabled && setAtMode('live')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          atMode === 'live'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Live Mode</div>
                            <p className="text-xs text-gray-500 mt-1">Send real SMS messages</p>
                          </div>
                          <Switch
                            checked={atMode === 'live'}
                            onCheckedChange={(checked) => checked && setAtMode('live')}
                          />
                        </div>
                        {atMode === 'live' && (
                          <p className="text-xs text-green-600 mt-2">Real SMS will be sent</p>
                        )}
                      </div>
                    </div>

                    {/* API Credentials */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-gray-900">API Credentials</h3>
                      </div>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                        <div className="flex gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">Security Notice</p>
                            <p className="text-xs text-amber-700 mt-1">
                              Get your API credentials from your{' '}
                              <a href="https://account.africastalking.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                                Africa&apos;s Talking Dashboard <ExternalLink className="w-3 h-3" />
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>

                      {hasExistingAtCredentials && (
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
                            Username {!hasExistingAtCredentials && <span className="text-red-500">*</span>}
                          </label>
                          <Input
                            placeholder={hasExistingAtCredentials ? '••••••••••••••••' : 'sandbox or your_username'}
                            value={atUsername}
                            onChange={(e) => setAtUsername(e.target.value)}
                            disabled={!atEnabled}
                          />
                          <p className="text-xs text-gray-500 mt-1">Use &apos;sandbox&apos; for testing</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key {!hasExistingAtCredentials && <span className="text-red-500">*</span>}
                          </label>
                          <Input
                            type="password"
                            placeholder={hasExistingAtCredentials ? '••••••••••••••••' : 'Enter API key'}
                            value={atApiKey}
                            onChange={(e) => setAtApiKey(e.target.value)}
                            disabled={!atEnabled}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
                          <Input
                            placeholder="Your registered sender ID"
                            value={atSenderId}
                            onChange={(e) => setAtSenderId(e.target.value)}
                            disabled={!atEnabled}
                          />
                          <p className="text-xs text-gray-500 mt-1">Optional - defaults to AFRICASTKNG</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handleTestAt}
                      disabled={isTestingAt || !atEnabled}
                    >
                      {isTestingAt ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                    <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handleSaveAt}
                      disabled={isSavingAt || !atEnabled}
                    >
                      {isSavingAt ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : atGatewayId ? (
                        'Update Configuration'
                      ) : (
                        'Save Configuration'
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* WhatsApp (APIWAP) Configuration */}
              {activeSmsProvider === 'whatsapp' && (
                <Card className="p-6 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">WhatsApp (APIWAP)</div>
                        <p className="text-sm text-gray-500">Platform-managed WhatsApp messaging for all tenants</p>
                      </div>
                    </div>
                    {isLoadingWhatsappGateway ? (
                      <Badge variant="outline" className="text-gray-400 border-gray-300">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </Badge>
                    ) : whatsappGateway ? (
                      <Badge variant="outline" className={whatsappGateway.is_active ? "text-green-600 border-green-300" : "text-gray-400 border-gray-300"}>
                        {whatsappGateway.status === 'active' ? 'Active' : whatsappGateway.status === 'pending_verification' ? 'Pending Verification' : whatsappGateway.status === 'error' ? 'Error' : 'Inactive'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-300">
                        Not Configured
                      </Badge>
                    )}
                  </div>

                  {/* Info Banner */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Platform-Managed Integration
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Configure your APIWAP API keys here. ISP providers will simply subscribe (500 KES/month) to enable WhatsApp messaging for their organization. No technical configuration needed from tenants.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Mode Toggles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setWhatsappMode('sandbox')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          whatsappMode === 'sandbox'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Sandbox Mode</div>
                            <p className="text-xs text-gray-500 mt-1">Use sandbox credentials</p>
                          </div>
                          <Switch
                            checked={whatsappMode === 'sandbox'}
                            onCheckedChange={(checked) => checked && setWhatsappMode('sandbox')}
                          />
                        </div>
                        {whatsappMode === 'sandbox' && (
                          <p className="text-xs text-amber-600 mt-2">Messages will be logged but not sent</p>
                        )}
                      </div>
                      <div
                        onClick={() => setWhatsappMode('production')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          whatsappMode === 'production'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Production Mode</div>
                            <p className="text-xs text-gray-500 mt-1">Send real WhatsApp messages</p>
                          </div>
                          <Switch
                            checked={whatsappMode === 'production'}
                            onCheckedChange={(checked) => checked && setWhatsappMode('production')}
                          />
                        </div>
                        {whatsappMode === 'production' && (
                          <p className="text-xs text-green-600 mt-2">Real WhatsApp messages will be sent</p>
                        )}
                      </div>
                    </div>

                    {/* API Credentials */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">API Credentials</h3>
                      </div>
                      <div className={`p-4 border rounded-lg mb-4 ${whatsappMode === 'sandbox' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex gap-2">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${whatsappMode === 'sandbox' ? 'text-amber-600' : 'text-blue-600'}`} />
                          <div>
                            <p className={`text-sm font-medium ${whatsappMode === 'sandbox' ? 'text-amber-800' : 'text-blue-800'}`}>
                              {whatsappMode === 'sandbox' ? 'Sandbox Environment' : 'Production Environment'}
                            </p>
                            <p className={`text-sm ${whatsappMode === 'sandbox' ? 'text-amber-700' : 'text-blue-700'} mt-1`}>
                              {whatsappMode === 'sandbox'
                                ? 'Use your APIWAP sandbox API key for testing. Messages will not be delivered.'
                                : 'Use your APIWAP production API key. Real WhatsApp messages will be sent and charged.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            APIWAP API Key <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="password"
                            value={whatsappApiKey}
                            onChange={(e) => setWhatsappApiKey(e.target.value)}
                            placeholder={hasExistingWhatsappCredentials ? "••••••••••••••••" : "Enter your APIWAP API key"}
                            className="font-mono"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Get your API key from <a href="https://apiwap.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">APIWAP Dashboard</a>
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook URL <span className="text-gray-400">(Optional)</span>
                          </label>
                          <Input
                            type="url"
                            value={whatsappWebhookUrl}
                            onChange={(e) => setWhatsappWebhookUrl(e.target.value)}
                            placeholder="https://your-domain.com/webhooks/whatsapp"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Receive delivery status callbacks from APIWAP
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Test Connection */}
                    {whatsappGateway && whatsappGateway.has_credentials && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Check className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Test Connection</h3>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 mb-4">
                            Send a test WhatsApp message to verify your configuration
                          </p>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number (with country code)
                              </label>
                              <Input
                                type="tel"
                                value={whatsappTestPhone}
                                onChange={(e) => setWhatsappTestPhone(e.target.value)}
                                placeholder="+254712345678"
                              />
                            </div>
                            <Button
                              variant="outline"
                              onClick={async () => {
                                if (!whatsappTestPhone.trim()) {
                                  toast.error('Please enter a phone number');
                                  return;
                                }
                                setIsTestingWhatsapp(true);
                                try {
                                  await testWhatsappGateway.mutateAsync({
                                    phone_number: whatsappTestPhone,
                                    test_message: 'Test message from ISP Billing Platform'
                                  });
                                } finally {
                                  setIsTestingWhatsapp(false);
                                }
                              }}
                              disabled={isTestingWhatsapp || !whatsappTestPhone.trim()}
                              className="w-full"
                            >
                              {isTestingWhatsapp ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                'Send Test Message'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {whatsappGateway?.last_error && whatsappGateway.status === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex gap-2">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Last Error</p>
                            <p className="text-sm text-red-700 mt-1">{whatsappGateway.last_error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analytics */}
                    {whatsappAnalytics && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">WhatsApp Analytics</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {whatsappAnalytics.active_subscriptions}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Active Subscriptions</div>
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {whatsappAnalytics.total_messages_this_month.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Messages This Month</div>
                          </div>
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              KES {whatsappAnalytics.total_revenue_this_month.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Revenue This Month</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={async () => {
                          if (!whatsappApiKey.trim()) {
                            toast.error('Please enter your APIWAP API key');
                            return;
                          }
                          setIsSavingWhatsapp(true);
                          try {
                            await saveWhatsappGateway.mutateAsync({
                              api_key: whatsappApiKey,
                              environment: whatsappMode,
                              webhook_url: whatsappWebhookUrl || undefined
                            });
                            setWhatsappApiKey(''); // Clear for security
                            setHasExistingWhatsappCredentials(true);
                          } finally {
                            setIsSavingWhatsapp(false);
                          }
                        }}
                        disabled={isSavingWhatsapp || !whatsappApiKey.trim()}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isSavingWhatsapp ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : whatsappGateway ? (
                          'Update Configuration'
                        ) : (
                          'Save Configuration'
                        )}
                      </Button>
                      {whatsappGateway && (
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this WhatsApp gateway configuration? This will disable WhatsApp messaging for all tenants.')) {
                              await deleteWhatsappGateway.mutateAsync();
                              setWhatsappApiKey('');
                              setWhatsappWebhookUrl('');
                              setHasExistingWhatsappCredentials(false);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* SMS Pricing & Payment Settings */}
              {activeSmsProvider === 'pricing' && (
                <Card className="p-6 border-l-4 border-l-pink-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">SMS Pricing & Payment Collection</div>
                        <p className="text-sm text-gray-500">Configure pricing for ISPs and where their payments are collected</p>
                      </div>
                    </div>
                    {isLoadingSmsPricing && (
                      <Badge variant="outline" className="text-gray-400 border-gray-300">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* SMS Pricing Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-pink-600" />
                        <h3 className="font-semibold text-gray-900">SMS Pricing</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Set the cost per SMS unit that ISPs will pay when they top up their SMS credits.
                        All SMS sent by ISPs will use the platform&apos;s Africa&apos;s Talking account.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cost per SMS (KES) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.50"
                            value={smsCostPerUnit}
                            onChange={(e) => setSmsCostPerUnit(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">Amount ISPs pay per SMS message</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Top-up Amount (KES) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            step="10"
                            min="0"
                            placeholder="100"
                            value={smsMinTopUp}
                            onChange={(e) => setSmsMinTopUp(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">Minimum amount for SMS credit top-up</p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            <strong>How it works:</strong> When an ISP tops up KES {smsMinTopUp || '100'}, they get{' '}
                            <strong>{Math.floor((parseFloat(smsMinTopUp) || 100) / (parseFloat(smsCostPerUnit) || 0.50))} SMS credits</strong>{' '}
                            at KES {smsCostPerUnit || '0.50'} per SMS.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Collection Section */}
                    <div className="border-t pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-pink-600" />
                        <h3 className="font-semibold text-gray-900">Payment Collection Account</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Configure where ISP payments for SMS credits will be collected.
                        ISPs will see these payment details when topping up their SMS balance.
                      </p>

                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div
                          onClick={() => setSmsPaymentMethod('paystack')}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            smsPaymentMethod === 'paystack'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">P</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Paystack</div>
                                <p className="text-xs text-gray-500">Cards & Mobile Money</p>
                              </div>
                            </div>
                            <Switch
                              checked={smsPaymentMethod === 'paystack'}
                              onCheckedChange={(checked) => checked && setSmsPaymentMethod('paystack')}
                            />
                          </div>
                          {smsPaymentMethod === 'paystack' && (
                            <p className="text-xs text-blue-600 mt-2">Uses platform Paystack config</p>
                          )}
                        </div>
                        <div
                          onClick={() => setSmsPaymentMethod('mpesa')}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            smsPaymentMethod === 'mpesa'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">M</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">M-Pesa</div>
                                <p className="text-xs text-gray-500">Paybill or Till</p>
                              </div>
                            </div>
                            <Switch
                              checked={smsPaymentMethod === 'mpesa'}
                              onCheckedChange={(checked) => checked && setSmsPaymentMethod('mpesa')}
                            />
                          </div>
                        </div>
                        <div
                          onClick={() => setSmsPaymentMethod('bank')}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            smsPaymentMethod === 'bank'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-bold text-sm">B</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Bank</div>
                                <p className="text-xs text-gray-500">Bank Transfer</p>
                              </div>
                            </div>
                            <Switch
                              checked={smsPaymentMethod === 'bank'}
                              onCheckedChange={(checked) => checked && setSmsPaymentMethod('bank')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Paystack Info */}
                      {smsPaymentMethod === 'paystack' && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-bold">P</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Paystack Integration</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                ISP SMS top-ups will be processed through your platform&apos;s Paystack account configured in{' '}
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('payments')}
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  Payment Options
                                </button>.
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                ISPs can pay using cards, bank transfers, USSD, or mobile money.
                                Funds are deposited directly to your Paystack balance.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* M-Pesa Details */}
                      {smsPaymentMethod === 'mpesa' && (
                        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Paybill Number</label>
                              <Input
                                placeholder="e.g., 123456"
                                value={smsMpesaPaybill}
                                onChange={(e) => setSmsMpesaPaybill(e.target.value)}
                              />
                              <p className="text-xs text-gray-500 mt-1">Leave empty if using Till Number</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Till Number</label>
                              <Input
                                placeholder="e.g., 5678901"
                                value={smsMpesaTill}
                                onChange={(e) => setSmsMpesaTill(e.target.value)}
                              />
                              <p className="text-xs text-gray-500 mt-1">Leave empty if using Paybill</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name / Reference</label>
                            <Input
                              placeholder="e.g., SMS Credits"
                              value={smsMpesaAccountName}
                              onChange={(e) => setSmsMpesaAccountName(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Account reference for Paybill payments</p>
                          </div>
                        </div>
                      )}

                      {/* Bank Details */}
                      {smsPaymentMethod === 'bank' && (
                        <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <Input
                              placeholder="e.g., Equity Bank"
                              value={smsBankName}
                              onChange={(e) => setSmsBankName(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                              <Input
                                placeholder="e.g., 0123456789012"
                                value={smsBankAccountNumber}
                                onChange={(e) => setSmsBankAccountNumber(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                              <Input
                                placeholder="e.g., Nairobi CBD"
                                value={smsBankBranch}
                                onChange={(e) => setSmsBankBranch(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <Button
                      className="bg-pink-600 hover:bg-pink-700"
                      onClick={handleSaveSmsPricing}
                      disabled={isSavingSmsPricing}
                    >
                      {isSavingSmsPricing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Pricing Settings'
                      )}
                    </Button>
                  </div>
                </Card>
              )}
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

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-900">Email Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <Input placeholder="smtp.example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <Input type="number" defaultValue="587" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <Input placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                  <Input placeholder="noreply@ispbilling.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                  <Input defaultValue="ISP Billing Platform" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Send Test Email</Button>
                <Button className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-900">Notification Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Send email when new organization signs up</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Send email when invoice is generated</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Send email when payment is received</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Send email when organization is suspended</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">Send daily summary email</span>
                </label>
              </div>
              <div className="flex justify-end">
                <Button className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
              </div>
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
                <Button className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
