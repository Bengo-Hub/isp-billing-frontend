'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import { WhatsAppSubscriptionDialog } from '@/components/whatsapp/WhatsAppSubscriptionDialog';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import {
  useDeleteLogo,
  useHotspotSettings,
  usePPPoESettings,
  useSaveHotspotSettings,
  useSavePPPoESettings,
  useSaveSetting,
  useSettings,
  useUploadLogo,
} from '@/features/settings/api';
import {
  PayoutRecipientType,
  PayoutScheduleType,
  useBanks,
  useGatewayConfig,
  usePayoutConfig,
  usePayoutRecipientTypes,
  usePayoutScheduleTypes,
  useResolveAccount,
  useSaveGatewayConfig,
  useSavePayoutConfig,
  useTestGateway,
  useUpdatePayoutConfig
} from '@/features/settings/gateways';
import { usePermissions } from '@/lib/stores/rbac';
import { useAuthStore } from '@/lib/store/auth';
import { useOrganization } from '@/features/platform/api';
import { AlertCircle, CheckCircle2, Info, Loader2, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const tabs = [
  { id: 'general', label: 'General Settings' },
  { id: 'payments', label: 'Payments' },
  { id: 'pppoe', label: 'PPPoE' },
  { id: 'hotspot', label: 'Hotspot' },
  { id: 'sms', label: 'SMS Gateway' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'notifications', label: 'Notifications' },
];

export default function SettingsTabs() {
  const [active, setActive] = useState('general');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <Button className="bg-brand-600 hover:bg-brand-700 w-full sm:w-auto" form={`form-${active}`} type="submit">Save changes</Button>
      </div>

      {/* Responsive tabs - horizontal scroll on mobile */}
      <div className="flex items-center gap-4 sm:gap-6 border-b overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((t) => (
          <button 
            key={t.id} 
            className={`py-3 -mb-px border-b-2 text-sm flex items-center gap-2 whitespace-nowrap ${active === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} 
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === 'general' && <GeneralTab />}
        {active === 'payments' && <PaymentsTab />}
        {active === 'pppoe' && <PPPoETab />}
        {active === 'hotspot' && <HotspotTab />}
        {active === 'sms' && <SMSTab />}
        {active === 'whatsapp' && <WhatsAppTab />}
        {active === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}

const DEFAULT_LOGO = '/images/logo/logo.png';

function GeneralTab() {
  const { data = {} as any } = useSettings('system');
  const save = useSaveSetting('system');
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();
  const [logo, setLogo] = useState<string>(data['system.logo_url'] || DEFAULT_LOGO);
  const [terms, setTerms] = useState<string>(data['system.terms_text'] ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string>(data['system.primary_color'] || '#801066');

  // Sync logo from settings when data loads
  useState(() => {
    if (data['system.logo_url']) {
      setLogo(data['system.logo_url']);
    } else {
      setLogo(DEFAULT_LOGO);
    }
    if (data['system.primary_color']) {
      setPrimaryColor(data['system.primary_color']);
    }
  });

  const handleLogoUpload = async (file: File | null) => {
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadLogo.mutateAsync(file);
        if (result?.logo_url) {
          setLogo(result.logo_url);
        }
      } finally {
        setIsUploading(false);
      }
    } else {
      // File removed - delete logo from server and reset to default
      try {
        await deleteLogo.mutateAsync();
      } catch {
        // Ignore errors when deleting (logo may not exist on server)
      }
      setLogo(DEFAULT_LOGO);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Information</h3>
        <form id="form-general" onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            'system.company_name': (e.currentTarget.elements.namedItem('company') as HTMLInputElement).value,
            'system.primary_color': primaryColor,
            'system.support_email': (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value,
            'system.support_phone': (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value,
            'system.terms_text': terms,
            'system.logo_url': logo,
            'system.require_terms_consent': true,
            'system.theme': (e.currentTarget.elements.namedItem('theme') as HTMLSelectElement).value,
          });
        }} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <Input
              name="company"
              defaultValue={data['system.company_name'] ?? ''}
              placeholder="e.g., Codevertex Africa Limited"
            />
            <p className="text-xs text-gray-500 mt-1">The name of your ISP / WiFi Company</p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Support Email</label>
              <Input
                name="email"
                type="email"
                defaultValue={data['system.support_email'] ?? ''}
                placeholder="support@yourcompany.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Support Phone</label>
              <Input
                name="phone"
                defaultValue={data['system.support_phone'] ?? ''}
                placeholder="+254 700 000000"
              />
            </div>
          </div>

          {/* Branding Section */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Branding & Appearance</h4>

            {/* Logo Upload */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700">Company Logo</label>
              <p className="text-xs text-gray-500 mb-2">Upload your company logo to personalize your dashboard and customer portal</p>
              <FileUpload
                name="logo"
                accept="image/*"
                maxSize={2}
                previewUrl={logo}
                disabled={isUploading}
                onFileChange={handleLogoUpload}
              />
              {isUploading && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading logo...
                </p>
              )}
            </div>

            {/* Brand Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Primary Brand Color</label>
                <div className="flex gap-3 mt-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#801066"
                      className="font-mono"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">This color will be applied across your dashboard and customer portal</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Theme</label>
                <select
                  name="theme"
                  defaultValue={data['system.theme'] ?? 'system'}
                  className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose your preferred color theme</p>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Brand Color Preview:</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </button>
                  <span
                    className="px-3 py-2 text-sm font-medium rounded-md"
                    style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}
                  >
                    Badge
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t pt-6">
            <RichTextEditor
              label="Terms & Conditions"
              value={terms}
              onChange={(value) => setTerms(value)}
              placeholder="Define the terms and conditions for your WiFi service"
              minHeight="300px"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PaymentsTab() {
  const { data = {} as any } = useSettings('payments');
  const save = useSaveSetting('payments');

  // Payout configuration
  const { data: payoutConfig, isLoading: payoutLoading } = usePayoutConfig();
  const { data: scheduleTypes = [] } = usePayoutScheduleTypes();
  const { data: recipientTypes = [] } = usePayoutRecipientTypes();
  const savePayoutConfig = useSavePayoutConfig();
  const updatePayoutConfig = useUpdatePayoutConfig();

  // Map currency to country for bank listing
  const currencyToCountry: Record<string, string> = {
    KES: 'kenya',
    NGN: 'nigeria',
    GHS: 'ghana',
    ZAR: 'south-africa'
  };

  // Bank listing and account resolution - dynamic based on currency
  const [bankCountry, setBankCountry] = useState('kenya');
  const { data: banks = [], isLoading: banksLoading } = useBanks(bankCountry);
  const resolveAccount = useResolveAccount();
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);

  // Helper to copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    schedule_type: 'daily' as PayoutScheduleType,
    payout_day: 1,
    payout_time: '17:00',
    recipient_type: 'kepss' as PayoutRecipientType,
    bank_code: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    mobile_number: '',
    currency: 'KES',
    min_payout_amount: 1000,
  });

  // Sync form with existing config
  useEffect(() => {
    if (payoutConfig) {
      setPayoutForm({
        schedule_type: payoutConfig.schedule_type as PayoutScheduleType,
        payout_day: payoutConfig.payout_day || 1,
        payout_time: payoutConfig.payout_time || '17:00',
        recipient_type: payoutConfig.recipient_type as PayoutRecipientType,
        bank_code: payoutConfig.bank_code || '',
        bank_name: payoutConfig.bank_name || '',
        account_number: payoutConfig.account_number || '',
        account_name: payoutConfig.account_name || '',
        mobile_number: payoutConfig.mobile_number || '',
        currency: payoutConfig.currency || 'KES',
        min_payout_amount: payoutConfig.min_payout_amount || 1000,
      });
      // Set bank country based on currency
      const currency = payoutConfig.currency || 'KES';
      setBankCountry(currencyToCountry[currency] || 'kenya');
      // Mark as verified if account_name exists
      if (payoutConfig.account_name) {
        setAccountVerified(true);
      }
    }
  }, [payoutConfig]);

  // Handle bank selection - auto-fill bank name
  const handleBankChange = (bankCode: string) => {
    const selectedBank = banks.find(b => b.code === bankCode);
    setPayoutForm(prev => ({
      ...prev,
      bank_code: bankCode,
      bank_name: selectedBank?.name || '',
      account_name: '' // Reset account name when bank changes
    }));
    // Reset verification when bank changes
    setAccountVerified(false);
  };

  // Verify account number
  const handleVerifyAccount = async () => {
    if (!payoutForm.bank_code) {
      toast.error('Please select a bank first');
      return;
    }
    if (!payoutForm.account_number) {
      toast.error('Please enter an account number');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await resolveAccount.mutateAsync({
        accountNumber: payoutForm.account_number,
        bankCode: payoutForm.bank_code
      });
      setPayoutForm(prev => ({ ...prev, account_name: result.account_name }));
      setAccountVerified(true);
      toast.success(`Account verified: ${result.account_name}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to verify account');
      setAccountVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset verification when account number changes
  const handleAccountNumberChange = (value: string) => {
    setPayoutForm({ ...payoutForm, account_number: value });
    setAccountVerified(false);
  };

  // Handle currency change - update bank country and reset bank selection
  const handleCurrencyChange = (currency: string) => {
    const country = currencyToCountry[currency] || 'kenya';
    setBankCountry(country);
    setPayoutForm({
      ...payoutForm,
      currency,
      bank_code: '',
      bank_name: '',
      account_number: '',
      account_name: ''
    });
    setAccountVerified(false);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...payoutForm,
      payout_day: ['weekly', 'monthly'].includes(payoutForm.schedule_type) ? payoutForm.payout_day : undefined,
    };

    if (payoutConfig) {
      updatePayoutConfig.mutate(payload, {
        onSuccess: () => toast.success('Payout configuration updated'),
        onError: () => toast.error('Failed to update payout configuration'),
      });
    } else {
      savePayoutConfig.mutate(payload, {
        onSuccess: () => toast.success('Payout configuration saved'),
        onError: () => toast.error('Failed to save payout configuration'),
      });
    }
  };

  const selectedRecipientType = recipientTypes.find(r => r.type === payoutForm.recipient_type);
  const selectedScheduleType = scheduleTypes.find(s => s.type === payoutForm.schedule_type);
  const showDaySelector = selectedScheduleType?.requires_day;
  const isMobileMoney = ['mobile_money', 'mobile_money_business'].includes(payoutForm.recipient_type);

  return (
    <div className="space-y-6 gap-2">
      {/* Payout Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Payout Configuration</div>
            <p className="text-xs text-gray-500 mt-1">
              Configure how and when collected payments are disbursed to your account
            </p>
          </div>
          {payoutConfig && (
            <div className="flex items-center gap-2">
              {payoutConfig.is_verified ? (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  <AlertCircle className="h-3 w-3" /> Pending Verification
                </span>
              )}
            </div>
          )}
        </div>

        {payoutLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            {/* Schedule Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Payout Schedule</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={payoutForm.schedule_type}
                  onChange={(e) => setPayoutForm({ ...payoutForm, schedule_type: e.target.value as PayoutScheduleType })}
                >
                  {scheduleTypes.map((type) => (
                    <option key={type.type} value={type.type}>{type.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{selectedScheduleType?.description}</p>
              </div>

              {showDaySelector && (
                <div>
                  <label className="text-sm text-gray-700">
                    {payoutForm.schedule_type === 'weekly' ? 'Payout Day' : 'Payout Date'}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={payoutForm.payout_day}
                    onChange={(e) => setPayoutForm({ ...payoutForm, payout_day: parseInt(e.target.value) })}
                  >
                    {selectedScheduleType?.day_options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-700">Payout Time</label>
                <Input 
                  type="time" 
                  value={payoutForm.payout_time}
                  onChange={(e) => setPayoutForm({ ...payoutForm, payout_time: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Minimum Payout Amount</label>
                <Input 
                  type="number" 
                  min={0}
                  value={payoutForm.min_payout_amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, min_payout_amount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">Payouts only trigger when balance exceeds this amount</p>
              </div>
            </div>

            {/* Recipient Type */}
            <div className="border-t pt-4">
              <label className="text-sm text-gray-700 font-medium block mb-2">Payout Account (Paystack Transfer Recipient)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">Recipient Type</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={payoutForm.recipient_type}
                    onChange={(e) => setPayoutForm({ ...payoutForm, recipient_type: e.target.value as PayoutRecipientType })}
                  >
                    {recipientTypes.filter(r => r.is_enabled).map((type) => (
                      <option key={type.type} value={type.type}>{type.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{selectedRecipientType?.description}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-700">Currency</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={payoutForm.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                  >
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="GHS">GHS - Ghanaian Cedi</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                  </select>
                </div>

                {!isMobileMoney && (
                  <>
                    <div>
                      <label className="text-sm text-gray-700">Bank Code</label>
                      <Input
                        placeholder="e.g., 033"
                        value={payoutForm.bank_code}
                        onChange={(e) => {
                          const code = e.target.value;
                          const matchedBank = banks.find(b => b.code === code);
                          setPayoutForm(prev => ({
                            ...prev,
                            bank_code: code,
                            bank_name: matchedBank?.name || prev.bank_name
                          }));
                          setAccountVerified(false);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter bank code or select from Bank Name dropdown</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Bank Name</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={payoutForm.bank_code}
                        onChange={(e) => handleBankChange(e.target.value)}
                        disabled={banksLoading}
                      >
                        <option value="">Select a bank</option>
                        {banks.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name} ({bank.code})
                          </option>
                        ))}
                      </select>
                      {banksLoading && (
                        <p className="text-xs text-gray-500 mt-1">Loading banks...</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Account Number</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Account number"
                          value={payoutForm.account_number}
                          onChange={(e) => handleAccountNumberChange(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleVerifyAccount}
                          disabled={isVerifying || !payoutForm.bank_code || !payoutForm.account_number}
                          className="shrink-0"
                        >
                          {isVerifying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : accountVerified ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {accountVerified ? 'Account verified' : 'Enter account number and click Verify'}
                      </p>
                    </div>
                  </>
                )}

                {isMobileMoney && (
                  <>
                    <div>
                      <label className="text-sm text-gray-700">Mobile Money Provider</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={payoutForm.bank_code}
                        onChange={(e) => setPayoutForm({ ...payoutForm, bank_code: e.target.value })}
                      >
                        <option value="">Select provider</option>
                        <option value="MPESA">M-PESA (Kenya)</option>
                        <option value="MPPAYBILL">M-PESA Paybill (Kenya)</option>
                        <option value="MPTILL">M-PESA Till (Kenya)</option>
                        <option value="MTN">MTN Mobile Money (Ghana)</option>
                        <option value="VODAFONE">Vodafone Cash (Ghana)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">
                        {payoutForm.bank_code === 'MPPAYBILL' || payoutForm.bank_code === 'MPTILL' ? 'Paybill/Till Number' : 'Mobile Number'}
                      </label>
                      <Input 
                        placeholder={payoutForm.bank_code === 'MPPAYBILL' || payoutForm.bank_code === 'MPTILL' ? 'Paybill/Till number' : '07XXXXXXXX'}
                        value={payoutForm.mobile_number}
                        onChange={(e) => setPayoutForm({ ...payoutForm, mobile_number: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm text-gray-700">
                    Account Holder Name
                    {accountVerified && !isMobileMoney && (
                      <span className="ml-2 text-xs text-green-600">(Verified)</span>
                    )}
                  </label>
                  <Input
                    placeholder={isMobileMoney ? "Name on account" : "Auto-filled after verification"}
                    value={payoutForm.account_name}
                    onChange={(e) => isMobileMoney && setPayoutForm({ ...payoutForm, account_name: e.target.value })}
                    readOnly={!isMobileMoney}
                    className={!isMobileMoney ? 'bg-gray-50 cursor-not-allowed' : ''}
                  />
                  {!isMobileMoney && !accountVerified && payoutForm.bank_code && payoutForm.account_number && (
                    <p className="text-xs text-amber-600 mt-1">Click Verify to auto-fill this field</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats (if existing config) */}
            {payoutConfig && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Payouts</span>
                    <div className="font-semibold">{payoutConfig.total_payouts}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Amount</span>
                    <div className="font-semibold">{payoutConfig.currency} {payoutConfig.total_payout_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Payout</span>
                    <div className="font-semibold">
                      {payoutConfig.last_payout_at 
                        ? new Date(payoutConfig.last_payout_at).toLocaleDateString() 
                        : 'Never'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Amount</span>
                    <div className="font-semibold">
                      {payoutConfig.last_payout_amount 
                        ? `${payoutConfig.currency} ${payoutConfig.last_payout_amount.toLocaleString()}` 
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="submit" 
                disabled={savePayoutConfig.isPending || updatePayoutConfig.isPending}
              >
                {(savePayoutConfig.isPending || updatePayoutConfig.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {payoutConfig ? 'Update Payout Settings' : 'Save Payout Settings'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

function PPPoETab() {
  const { data: settings, isLoading } = usePPPoESettings();
  const save = useSavePPPoESettings();

  const [formData, setFormData] = useState({
    require_username_approval: false,
    allow_self_registration: true,
    session_timeout_minutes: 60,
    auto_disconnect_expired: true,
  });

  // Sync form with loaded settings
  useEffect(() => {
    if (settings) {
      setFormData({
        require_username_approval: settings.require_username_approval,
        allow_self_registration: settings.allow_self_registration,
        session_timeout_minutes: settings.session_timeout_minutes,
        auto_disconnect_expired: settings.auto_disconnect_expired,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(formData);
  };

  if (isLoading) {
    return <Card className="p-6"><div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div></Card>;
  }

  return (
    <Card className="p-6">
      <form id="form-pppoe" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Session Timeout (minutes)</label>
            <Input
              type="number"
              min={1}
              max={1440}
              value={formData.session_timeout_minutes}
              onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 60 })}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum session duration before automatic logout</p>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.require_username_approval}
              onChange={(e) => setFormData({ ...formData, require_username_approval: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Require admin approval for new usernames</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allow_self_registration}
              onChange={(e) => setFormData({ ...formData, allow_self_registration: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Allow customer self-registration</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.auto_disconnect_expired}
              onChange={(e) => setFormData({ ...formData, auto_disconnect_expired: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Auto-disconnect expired sessions</span>
          </label>
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function HotspotTab() {
  const { data: settings, isLoading } = useHotspotSettings();
  const save = useSaveHotspotSettings();
  const user = useAuthStore((state) => state.user);

  // Get current organization details to access slug for captive portal URL
  const { data: organization } = useOrganization(user?.organization_id ? parseInt(user.organization_id) : 0);

  const [formData, setFormData] = useState({
    username_prefix: 'C',
    hotspot_template: 'Aurora',
    prune_inactive_users_days: 14,
    redirect_url: 'https://www.google.com',
    voucher_format: 'XXXX-XXXX-XXXX',
    voucher_length: 12,
    show_packages_on_portal: true,
    allow_guest_purchases: true,
    session_timeout_minutes: 60,
    auto_disconnect_expired: true,
  });

  // Sync form with loaded settings
  useEffect(() => {
    if (settings) {
      setFormData({
        username_prefix: settings.username_prefix,
        hotspot_template: settings.hotspot_template,
        prune_inactive_users_days: settings.prune_inactive_users_days,
        redirect_url: settings.redirect_url,
        voucher_format: settings.voucher_format,
        voucher_length: settings.voucher_length,
        show_packages_on_portal: settings.show_packages_on_portal,
        allow_guest_purchases: settings.allow_guest_purchases,
        session_timeout_minutes: settings.session_timeout_minutes,
        auto_disconnect_expired: settings.auto_disconnect_expired,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(formData);
  };

  if (isLoading) {
    return <Card className="p-6"><div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div></Card>;
  }

  return (
    <Card className="p-6">
      <form id="form-hotspot" onSubmit={handleSubmit} className="space-y-6">
        {/* Username Generation Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Auto-Generated Credentials</p>
              <p className="text-xs text-blue-700 mt-1">
                When customers purchase packages, they receive auto-generated hotspot credentials.
                Username format: <code className="bg-blue-100 px-1 rounded">{formData.username_prefix}001</code>, <code className="bg-blue-100 px-1 rounded">{formData.username_prefix}002</code>, etc.
                Password: Random 3-digit number (e.g., 865).
              </p>
            </div>
          </div>
        </div>

        {/* Username Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">Username Prefix</label>
            <Input
              value={formData.username_prefix}
              onChange={(e) => setFormData({ ...formData, username_prefix: e.target.value })}
              maxLength={10}
              placeholder="C"
            />
            <p className="text-xs text-gray-500 mt-1">Prefix for auto-generated usernames (e.g., C → C001, C002)</p>
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium">Hotspot Template</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={formData.hotspot_template}
              onChange={(e) => setFormData({ ...formData, hotspot_template: e.target.value })}
            >
              <option value="Aurora">Aurora</option>
              <option value="Modern">Modern</option>
              <option value="Classic">Classic</option>
              <option value="Minimal">Minimal</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Login page theme for the hotspot portal</p>
          </div>
        </div>

        {/* Session & Expiry Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">Prune Inactive Users After (days)</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={formData.prune_inactive_users_days}
              onChange={(e) => setFormData({ ...formData, prune_inactive_users_days: parseInt(e.target.value) || 14 })}
            />
            <p className="text-xs text-gray-500 mt-1">Auto-delete inactive users after this many days</p>
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium">Session Timeout (minutes)</label>
            <Input
              type="number"
              min={1}
              max={1440}
              value={formData.session_timeout_minutes}
              onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 60 })}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum session duration before automatic logout</p>
          </div>
        </div>

        {/* Redirect URL */}
        <div>
          <label className="text-sm text-gray-700 font-medium">Redirect URL</label>
          <Input
            value={formData.redirect_url}
            onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
            placeholder="https://www.google.com"
          />
          <p className="text-xs text-gray-500 mt-1">URL to redirect users after successful login</p>
        </div>

        {/* Portal Settings */}
        <div className="space-y-3 pt-4 border-t">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.show_packages_on_portal}
              onChange={(e) => setFormData({ ...formData, show_packages_on_portal: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Show available packages on the hotspot portal</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allow_guest_purchases}
              onChange={(e) => setFormData({ ...formData, allow_guest_purchases: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Allow guest purchases (without account)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.auto_disconnect_expired}
              onChange={(e) => setFormData({ ...formData, auto_disconnect_expired: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Auto-disconnect expired sessions</span>
          </label>
        </div>

        <div className="flex gap-3 justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Open captive portal with organization slug
              if (organization?.slug) {
                window.open(`/buy/${organization.slug}`, '_blank');
              } else {
                toast.error('Unable to load organization details. Please try again.');
              }
            }}
            disabled={!organization?.slug}
          >
            Preview Captive Portal
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SMSTab() {
  const { data = {} as any } = useSettings('sms');
  const save = useSaveSetting('sms');

  // Permission checks
  const { canManagePlatformSecrets, isSuperuser, isAdmin } = usePermissions();
  const canViewSecrets = canManagePlatformSecrets() || isSuperuser();
  const canSelectGateway = isAdmin() || isSuperuser();

  // Providers
  const [smsProvider, setSmsProvider] = useState<'twilio' | 'africastalking'>(data['sms.gateway_provider'] ?? 'twilio');
  const cfg = useGatewayConfig('sms', smsProvider);
  const saveCfg = useSaveGatewayConfig('sms', smsProvider);
  const testCfg = useTestGateway('sms', smsProvider);

  return (
    <div className="space-y-6">
      {/* Gateway Selection - Available to ISP Admin */}
      <Card className="p-6">
        <form id="form-sms" onSubmit={(e) => { e.preventDefault(); save.mutate({
          'sms.gateway_provider': (e.currentTarget.elements.namedItem('provider') as HTMLInputElement).value,
          'sms.enable_balance_alert': (e.currentTarget.elements.namedItem('balance') as HTMLInputElement).checked,
        }); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">SMS Gateway</label>
              <select name="provider" defaultValue={smsProvider} onChange={(e) => setSmsProvider(e.target.value as any)} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="twilio">Twilio</option>
                <option value="africastalking">Africa's Talking</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input name="balance" type="checkbox" defaultChecked={!!data['sms.enable_balance_alert']} />
              <span className="text-sm text-gray-700">Enable SMS Balance Alert</span>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>

      {/* SMS Provider Configuration - Platform Owner Only */}
      {canViewSecrets ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-amber-600" />
            <div className="text-sm font-semibold">{smsProvider === 'twilio' ? 'Twilio' : "Africa's Talking"} Configuration</div>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Platform Only</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault();
            const form = e.currentTarget.elements as any;
            const payload: Record<string, string> = smsProvider === 'twilio' ? {
              account_sid: form['sid'].value || '',
              auth_token: form['token'].value || '',
              phone_number: form['phone'].value || '',
            } : {
              username: form['at_user'].value || '',
              api_key: form['at_key'].value || '',
            };
            saveCfg.mutate(payload);
          }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smsProvider === 'twilio' ? (
              <>
                <Input name="sid" placeholder="Account SID" defaultValue={cfg.data?.configuration?.account_sid ?? ''} />
                <Input name="token" placeholder="Auth Token" type="password" defaultValue={cfg.data?.configuration?.auth_token ?? ''} />
                <Input name="phone" placeholder="Phone Number" defaultValue={cfg.data?.configuration?.phone_number ?? ''} />
              </>
            ) : (
              <>
                <Input name="at_user" placeholder="Username" defaultValue={cfg.data?.configuration?.username ?? ''} />
                <Input name="at_key" placeholder="API Key" type="password" defaultValue={cfg.data?.configuration?.api_key ?? ''} />
              </>
            )}
            <div className="col-span-full flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button type="submit" className="w-full sm:w-auto">Save</Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => testCfg.mutate({})}>Test</Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}

function WhatsAppTab() {
  const { data = {} as any } = useSettings('whatsapp');
  const save = useSaveSetting('whatsapp');
  const [enabled, setEnabled] = useState(!!data['whatsapp.enabled']);
  const [paymentConfirm, setPaymentConfirm] = useState(!!data['whatsapp.send_payment_confirmation']);
  const [expiryNotify, setExpiryNotify] = useState(!!data['whatsapp.send_expiry_notifications']);
  const [reminderNotify, setReminderNotify] = useState(!!data['whatsapp.send_reminder_notifications']);
  const [preferExpiry, setPreferExpiry] = useState(!!data['whatsapp.prefer_whatsapp_for_expiry']);
  const [preferReminders, setPreferReminders] = useState(!!data['whatsapp.prefer_whatsapp_for_reminders']);
  const [preferPayment, setPreferPayment] = useState(!!data['whatsapp.prefer_whatsapp_for_payment']);
  const [provider, setProvider] = useState(data['whatsapp.provider'] || 'apiwap');
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  useEffect(() => {
    setEnabled(!!data['whatsapp.enabled']);
    setPaymentConfirm(!!data['whatsapp.send_payment_confirmation']);
    setExpiryNotify(!!data['whatsapp.send_expiry_notifications']);
    setReminderNotify(!!data['whatsapp.send_reminder_notifications']);
    setPreferExpiry(!!data['whatsapp.prefer_whatsapp_for_expiry']);
    setPreferReminders(!!data['whatsapp.prefer_whatsapp_for_reminders']);
    setPreferPayment(!!data['whatsapp.prefer_whatsapp_for_payment']);
    setProvider(data['whatsapp.provider'] || 'apiwap');
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Subscription Status & Management */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Subscription</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Send WhatsApp notifications to your customers via {provider.toUpperCase()} gateway.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => setSubscriptionDialogOpen(true)}
              >
                Manage Subscription
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly Fee:</span>
                <span className="ml-2 font-semibold text-gray-900">KES 500</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* WhatsApp Settings Form */}
      <Card className="p-6">
        <form id="form-whatsapp" onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            'whatsapp.enabled': enabled,
            'whatsapp.provider': provider,
            'whatsapp.send_payment_confirmation': paymentConfirm,
            'whatsapp.send_expiry_notifications': expiryNotify,
            'whatsapp.send_reminder_notifications': reminderNotify,
            'whatsapp.prefer_whatsapp_for_expiry': preferExpiry,
            'whatsapp.prefer_whatsapp_for_reminders': preferReminders,
            'whatsapp.prefer_whatsapp_for_payment': preferPayment,
            'whatsapp.payment_hotspot_template': (e.currentTarget.elements.namedItem('payment_hotspot') as HTMLTextAreaElement).value,
            'whatsapp.payment_pppoe_template': (e.currentTarget.elements.namedItem('payment_pppoe') as HTMLTextAreaElement).value,
            'whatsapp.expiry_template': (e.currentTarget.elements.namedItem('expiry_tpl') as HTMLTextAreaElement).value,
            'whatsapp.reminder_template': (e.currentTarget.elements.namedItem('reminder_tpl') as HTMLTextAreaElement).value,
          });
        }} className="space-y-6">
          {/* Enable WhatsApp & Provider Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable WhatsApp Notifications</label>
                <p className="text-xs text-gray-500 mt-1">Send notifications to customers via WhatsApp</p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">WhatsApp Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="apiwap">APIWAP (Recommended)</option>
                <option value="twilio" disabled>Twilio (Coming Soon)</option>
                <option value="messagebird" disabled>MessageBird (Coming Soon)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select your WhatsApp messaging provider</p>
            </div>
          </div>

          {/* Notification Types */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Send payment confirmation messages</span>
                <Switch
                  checked={paymentConfirm}
                  onCheckedChange={setPaymentConfirm}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Send subscription expiry notifications</span>
                <Switch
                  checked={expiryNotify}
                  onCheckedChange={setExpiryNotify}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Send renewal reminder messages</span>
                <Switch
                  checked={reminderNotify}
                  onCheckedChange={setReminderNotify}
                />
              </div>
            </div>
          </div>

          {/* Delivery Preferences */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivery Preferences</h4>
            <p className="text-xs text-gray-600 mb-4">
              Choose WhatsApp instead of SMS for specific client notifications.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Prefer WhatsApp for expiry notifications</div>
                  <p className="text-xs text-gray-600 mt-1">
                    When a client subscription expires, send via WhatsApp instead of SMS.
                  </p>
                </div>
                <Switch
                  checked={preferExpiry}
                  onCheckedChange={setPreferExpiry}
                  className="ml-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Prefer WhatsApp for expiry reminders</div>
                  <p className="text-xs text-gray-600 mt-1">
                    When sending pre-expiry reminders, use WhatsApp instead of SMS.
                  </p>
                </div>
                <Switch
                  checked={preferReminders}
                  onCheckedChange={setPreferReminders}
                  className="ml-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Prefer WhatsApp for payment confirmations</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Send payment confirmation messages via WhatsApp instead of SMS.
                  </p>
                </div>
                <Switch
                  checked={preferPayment}
                  onCheckedChange={setPreferPayment}
                  className="ml-4"
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Fallback Strategy:</strong> If WhatsApp delivery fails, notifications automatically fall back to SMS (using your configured SMS gateway), then to email if email notifications are enabled.
                </p>
              </div>
            </div>
          </div>

          {/* Message Templates */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Message Templates</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Hotspot Payment Confirmation</label>
                <textarea
                  name="payment_hotspot"
                  rows={3}
                  defaultValue={data['whatsapp.payment_hotspot_template'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Hello @username! You have successfully subscribed..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: @username, @package_name, @expiry_date, @company_name
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">PPPoE Payment Confirmation</label>
                <textarea
                  name="payment_pppoe"
                  rows={3}
                  defaultValue={data['whatsapp.payment_pppoe_template'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Hello @username! Your subscription is active..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: @username, @password, @package_name, @expiry_date, @company_name
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Expiry Notification</label>
                <textarea
                  name="expiry_tpl"
                  rows={3}
                  defaultValue={data['whatsapp.expiry_template'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Hi @first_name, your subscription expires on..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: @first_name, @package_name, @expiry_date, @company_name
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Renewal Reminder</label>
                <textarea
                  name="reminder_tpl"
                  rows={3}
                  defaultValue={data['whatsapp.reminder_template'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Reminder: Your subscription expires in @days_left days..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: @first_name, @days_left, @expiry_date, @company_name
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="submit">Save WhatsApp Settings</Button>
          </div>
        </form>
      </Card>

      {/* WhatsApp Subscription Dialog */}
      <WhatsAppSubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        onSuccess={() => {
          // Optionally refresh settings or show success message
          setSubscriptionDialogOpen(false);
        }}
      />
    </div>
  );
}

function NotificationsTab() {
  const { data = {} as any } = useSettings('notifications');
  const save = useSaveSetting('notifications');

  return (
    <div className="space-y-6">
      {/* System Notifications */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">System Notifications</h3>
        <form id="form-notifications" onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            'notifications.mikrotik_status_enabled': (e.currentTarget.elements.namedItem('mt') as HTMLInputElement).checked,
            'notifications.payment_hotspot_template': (e.currentTarget.elements.namedItem('tpl_hotspot') as HTMLTextAreaElement).value,
            'notifications.payment_pppoe_template': (e.currentTarget.elements.namedItem('tpl_pppoe') as HTMLTextAreaElement).value,
            'notifications.expiry_hotspot': (e.currentTarget.elements.namedItem('exp_hs') as HTMLInputElement).checked,
            'notifications.expiry_pppoe': (e.currentTarget.elements.namedItem('exp_pppoe') as HTMLInputElement).checked,
            'notifications.reminder_hotspot': (e.currentTarget.elements.namedItem('rem_hs') as HTMLInputElement).checked,
            'notifications.reminder_pppoe': (e.currentTarget.elements.namedItem('rem_pppoe') as HTMLInputElement).checked,
            'notifications.email_subscription_enable': (e.currentTarget.elements.namedItem('email_enable') as HTMLInputElement).checked,
            'notifications.email_subject_pppoe': (e.currentTarget.elements.namedItem('email_subj') as HTMLInputElement).value,
            'notifications.email_template_pppoe': (e.currentTarget.elements.namedItem('email_tpl') as HTMLTextAreaElement).value,
          });
        }} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-900">Mikrotik Status Notifications</label>
              <p className="text-xs text-gray-500 mt-1">Receive notifications about MikroTik router status changes</p>
            </div>
            <input
              name="mt"
              type="checkbox"
              defaultChecked={!!data['notifications.mikrotik_status_enabled']}
              className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>

          {/* SMS Templates */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">SMS Notification Templates</h4>
            <p className="text-xs text-gray-600 mb-4">
              Customize SMS messages sent to customers. Use variable tags to personalize messages.
            </p>

            <div className="space-y-4">
              {/* Hotspot Payment Confirmation */}
              <div>
                <label className="text-sm font-medium text-gray-700">Hotspot Payment Confirmation SMS</label>
                <textarea
                  name="tpl_hotspot"
                  rows={3}
                  defaultValue={data['notifications.payment_hotspot_template'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Dear @username, you have successfully subscribed to @package_name..."
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Available tags:</span>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@username</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@package_name</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@expiry_date</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@password</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@company_name</code>
                </div>
              </div>

              {/* PPPoE Payment Confirmation */}
              <div>
                <label className="text-sm font-medium text-gray-700">PPPoE Payment Confirmation SMS</label>
                <textarea
                  name="tpl_pppoe"
                  rows={3}
                  defaultValue={data['notifications.payment_pppoe_template'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Dear @username, subscription to @package_name is active..."
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Available tags:</span>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@username</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@password</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@package_name</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@expiry_date</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@company_name</code>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Triggers */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Notification Triggers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  name="exp_hs"
                  type="checkbox"
                  defaultChecked={!!data['notifications.expiry_hotspot']}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">Send expiry notifications to Hotspot users</span>
              </label>
              <label className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  name="exp_pppoe"
                  type="checkbox"
                  defaultChecked={!!data['notifications.expiry_pppoe']}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">Send expiry notifications to PPPoE users</span>
              </label>
              <label className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  name="rem_hs"
                  type="checkbox"
                  defaultChecked={!!data['notifications.reminder_hotspot']}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">Send reminder notifications to Hotspot users</span>
              </label>
              <label className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  name="rem_pppoe"
                  type="checkbox"
                  defaultChecked={!!data['notifications.reminder_pppoe']}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">Send reminder notifications to PPPoE users</span>
              </label>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Email Subscription Reminders</h4>
              <label className="flex items-center gap-2">
                <input
                  name="email_enable"
                  type="checkbox"
                  defaultChecked={!!data['notifications.email_subscription_enable']}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-xs text-gray-600">Enable</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Subject for PPPoE Users</label>
                <Input
                  name="email_subj"
                  defaultValue={data['notifications.email_subject_pppoe'] ?? ''}
                  placeholder="Your subscription expires in @days_left days"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Available tags:</span>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@days_left</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@expiry_date</code>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email Message for PPPoE Users</label>
                <textarea
                  name="email_tpl"
                  rows={4}
                  defaultValue={data['notifications.email_template_pppoe'] ?? ''}
                  className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Dear @first_name, your internet will expire in @days_left days on @expiry_date..."
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Available tags:</span>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@first_name</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@username</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@days_left</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@expiry_date</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@package_name</code>
                  <code className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">@company_name</code>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="submit">Save Notification Settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
