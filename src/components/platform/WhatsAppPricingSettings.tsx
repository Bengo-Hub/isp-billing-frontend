'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, DollarSign, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface WhatsAppPricingSettings {
  id: number;
  monthly_subscription_fee: number;
  currency: string;
  minimum_subscription_months: number;
  payment_method: string;
  mpesa_paybill: string | null;
  mpesa_till_number: string | null;
  mpesa_account_name: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  bank_swift_code: string | null;
  paystack_subaccount_code: string | null;
  trial_enabled: boolean;
  trial_days: number;
  trial_message_limit: number;
  default_message_limit_per_month: number | null;
  auto_renewal_enabled: boolean;
  auto_renewal_grace_days: number;
  is_active: boolean;
}

export function WhatsAppPricingSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<WhatsAppPricingSettings>({
    id: 0,
    monthly_subscription_fee: 500.00,
    currency: 'KES',
    minimum_subscription_months: 1,
    payment_method: 'paystack',
    mpesa_paybill: null,
    mpesa_till_number: null,
    mpesa_account_name: null,
    bank_account_number: null,
    bank_name: null,
    bank_branch: null,
    bank_swift_code: null,
    paystack_subaccount_code: null,
    trial_enabled: true,
    trial_days: 7,
    trial_message_limit: 50,
    default_message_limit_per_month: null,
    auto_renewal_enabled: true,
    auto_renewal_grace_days: 3,
    is_active: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<WhatsAppPricingSettings>('/platform/whatsapp/settings/pricing');
      setSettings(response.data);
    } catch (error: any) {
      console.error('Failed to load WhatsApp pricing settings:', error);
      toast.error(error.response?.data?.detail || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.post('/platform/whatsapp/settings/pricing', settings);
      toast.success('WhatsApp pricing settings saved successfully');
      await loadSettings(); // Reload to get updated data
    } catch (error: any) {
      console.error('Failed to save WhatsApp pricing settings:', error);
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (key: keyof WhatsAppPricingSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Pricing & Payments</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure WhatsApp subscription pricing and payment collection settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Pricing Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold">Subscription Pricing</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="monthly_fee">Monthly Subscription Fee</Label>
            <Input
              id="monthly_fee"
              type="number"
              step="0.01"
              value={settings.monthly_subscription_fee}
              onChange={(e) => updateSettings('monthly_subscription_fee', parseFloat(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Amount ISP providers pay per month for WhatsApp access</p>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={settings.currency}
              onChange={(e) => updateSettings('currency', e.target.value.toUpperCase())}
              maxLength={3}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">3-letter currency code (e.g., KES, USD)</p>
          </div>

          <div>
            <Label htmlFor="min_months">Minimum Subscription Months</Label>
            <Input
              id="min_months"
              type="number"
              min="1"
              value={settings.minimum_subscription_months}
              onChange={(e) => updateSettings('minimum_subscription_months', parseInt(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum subscription duration required</p>
          </div>
        </div>
      </Card>

      {/* Payment Collection Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold">Payment Collection</h3>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={settings.payment_method}
              onValueChange={(value) => updateSettings('payment_method', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="mpesa">M-PESA</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">How ISP providers should pay for subscriptions</p>
          </div>

          {/* M-PESA Settings */}
          {settings.payment_method === 'mpesa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3">M-PESA Details</h4>
              </div>
              <div>
                <Label htmlFor="mpesa_paybill">Paybill Number</Label>
                <Input
                  id="mpesa_paybill"
                  value={settings.mpesa_paybill || ''}
                  onChange={(e) => updateSettings('mpesa_paybill', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mpesa_till">Till Number</Label>
                <Input
                  id="mpesa_till"
                  value={settings.mpesa_till_number || ''}
                  onChange={(e) => updateSettings('mpesa_till_number', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="mpesa_account">Account Name</Label>
                <Input
                  id="mpesa_account"
                  value={settings.mpesa_account_name || ''}
                  onChange={(e) => updateSettings('mpesa_account_name', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Bank Transfer Settings */}
          {settings.payment_method === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Account Details
                </h4>
              </div>
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={settings.bank_name || ''}
                  onChange={(e) => updateSettings('bank_name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bank_account">Account Number</Label>
                <Input
                  id="bank_account"
                  value={settings.bank_account_number || ''}
                  onChange={(e) => updateSettings('bank_account_number', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bank_branch">Branch</Label>
                <Input
                  id="bank_branch"
                  value={settings.bank_branch || ''}
                  onChange={(e) => updateSettings('bank_branch', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bank_swift">SWIFT Code</Label>
                <Input
                  id="bank_swift"
                  value={settings.bank_swift_code || ''}
                  onChange={(e) => updateSettings('bank_swift_code', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Paystack Settings */}
          {settings.payment_method === 'paystack' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Paystack Configuration</h4>
              <div>
                <Label htmlFor="paystack_subaccount">Subaccount Code (Optional)</Label>
                <Input
                  id="paystack_subaccount"
                  value={settings.paystack_subaccount_code || ''}
                  onChange={(e) => updateSettings('paystack_subaccount_code', e.target.value)}
                  placeholder="ACCT_xxxxxxxxxx"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to receive payments in main Paystack account
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Trial Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trial Period Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="trial_enabled"
                checked={settings.trial_enabled}
                onChange={(e) => updateSettings('trial_enabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="trial_enabled" className="cursor-pointer">Enable Trial Period</Label>
            </div>
          </div>

          {settings.trial_enabled && (
            <>
              <div>
                <Label htmlFor="trial_days">Trial Days</Label>
                <Input
                  id="trial_days"
                  type="number"
                  min="0"
                  value={settings.trial_days}
                  onChange={(e) => updateSettings('trial_days', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="trial_limit">Trial Message Limit</Label>
                <Input
                  id="trial_limit"
                  type="number"
                  min="0"
                  value={settings.trial_message_limit}
                  onChange={(e) => updateSettings('trial_message_limit', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Auto-Renewal Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Auto-Renewal Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="auto_renewal"
                checked={settings.auto_renewal_enabled}
                onChange={(e) => updateSettings('auto_renewal_enabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="auto_renewal" className="cursor-pointer">Enable Auto-Renewal</Label>
            </div>
          </div>

          {settings.auto_renewal_enabled && (
            <div>
              <Label htmlFor="grace_days">Grace Period (Days)</Label>
              <Input
                id="grace_days"
                type="number"
                min="0"
                value={settings.auto_renewal_grace_days}
                onChange={(e) => updateSettings('auto_renewal_grace_days', parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Days after expiry before suspension</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
