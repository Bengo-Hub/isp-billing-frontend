'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Editor } from '@/components/ui/editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { useDeleteLogo, useSaveSetting, useSettings, useUploadLogo } from '@/features/settings/api';
import {
    PayoutRecipientType,
    PayoutScheduleType,
    useGatewayConfig,
    usePayoutConfig,
    usePayoutRecipientTypes,
    usePayoutScheduleTypes,
    useSaveGatewayConfig,
    useSavePayoutConfig,
    useTestGateway,
    useUpdatePayoutConfig,
    useBanks,
    useResolveAccount
} from '@/features/settings/gateways';
import { usePermissions } from '@/lib/stores/rbac';
import { AlertCircle, CheckCircle2, Loader2, Lock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const tabs = [
  { id: 'general', label: 'General Settings' },
  { id: 'payments', label: 'Payments' },
  { id: 'pppoe', label: 'PPPoE' },
  { id: 'hotspot', label: 'Hotspot' },
  { id: 'sms', label: 'Messages' },
  { id: 'notifications', label: 'Notifications' },
];

export default function SettingsTabs() {
  const [active, setActive] = useState('general');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <Button className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto" form={`form-${active}`} type="submit">Save changes</Button>
      </div>

      {/* Responsive tabs - horizontal scroll on mobile */}
      <div className="flex items-center gap-4 sm:gap-6 border-b overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((t) => (
          <button 
            key={t.id} 
            className={`py-3 -mb-px border-b-2 text-sm flex items-center gap-2 whitespace-nowrap ${active === t.id ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} 
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

  // Sync logo from settings when data loads
  useState(() => {
    if (data['system.logo_url']) {
      setLogo(data['system.logo_url']);
    } else {
      setLogo(DEFAULT_LOGO);
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
    <Card className="p-6">
      <form id="form-general" onSubmit={(e) => { e.preventDefault(); save.mutate({
        'system.company_name': (e.currentTarget.elements.namedItem('company') as HTMLInputElement).value,
        'system.primary_color': (e.currentTarget.elements.namedItem('color') as HTMLInputElement).value,
        'system.support_email': (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value,
        'system.support_phone': (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value,
        'system.terms_text': terms,
        'system.logo_url': logo,
        'system.require_terms_consent': true,
        'system.theme': (e.currentTarget.elements.namedItem('theme') as HTMLSelectElement).value,
      }); }} className="space-y-4">
        <div>
          <label className="text-sm text-gray-700">The name of your ISP / WiFi Company</label>
          <Input name="company" defaultValue={data['system.company_name'] ?? ''} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Color</label>
            <Input name="color" defaultValue={data['system.primary_color'] ?? ''} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Theme</label>
            <select name="theme" defaultValue={data['system.theme'] ?? 'system'} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Customer Support Email</label>
            <Input name="email" defaultValue={data['system.support_email'] ?? ''} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Customer Support Number</label>
            <Input name="phone" defaultValue={data['system.support_phone'] ?? ''} />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-700">System Logo</label>
          <FileUpload
            name="logo"
            accept="image/*"
            maxSize={2}
            previewUrl={logo}
            disabled={isUploading}
            onFileChange={handleLogoUpload}
          />
          {isUploading && (
            <p className="text-xs text-gray-500 mt-1">Uploading logo...</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-700">Terms & Conditions</label>
          <Editor label="Terms & Conditions" value={terms} onChange={(value) => {
            setTerms(value);
          }} />
          </div>
        <div className="flex gap-3 justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
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
    <div className="space-y-6">
      {/* Notice about platform integrations */}
      <Card className="p-6 bg-blue-50 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Payment Gateway Configuration</p>
            <p className="text-xs text-blue-700 mt-1">
              Payment gateway credentials (M-Pesa, SMS providers) are managed by your platform administrator. 
              Contact support if you need changes to the gateway configuration.
            </p>
          </div>
        </div>
      </Card>

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
  const { data = {} as any } = useSettings('pppoe');
  const save = useSaveSetting('pppoe');
  return (
    <Card className="p-6">
      <form id="form-pppoe" onSubmit={(e) => { e.preventDefault(); save.mutate({
        'pppoe.prune_inactive_days': parseInt((e.currentTarget.elements.namedItem('prune') as HTMLInputElement).value || '14', 10),
        'pppoe.reminder_times_days': [5, 2, 0.16],
        'pppoe.enable_invoices': (e.currentTarget.elements.namedItem('invoices') as HTMLInputElement).checked,
      }); }} className="space-y-4">
        <div>
          <label className="text-sm text-gray-700">Prune Inactive Users After (days)</label>
          <Input name="prune" defaultValue={String(data['pppoe.prune_inactive_days'] ?? 14)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Enable Invoices</label>
          <input name="invoices" type="checkbox" defaultChecked={!!data['pppoe.enable_invoices']} />
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

function HotspotTab() {
  const { data = {} as any } = useSettings('hotspot');
  const save = useSaveSetting('hotspot');
  return (
    <Card className="p-6">
      <form id="form-hotspot" onSubmit={(e) => { e.preventDefault(); save.mutate({
        'hotspot.username_prefix': (e.currentTarget.elements.namedItem('prefix') as HTMLInputElement).value,
        'hotspot.template': (e.currentTarget.elements.namedItem('template') as HTMLInputElement).value,
        'hotspot.prune_inactive_days': parseInt((e.currentTarget.elements.namedItem('prune') as HTMLInputElement).value || '14', 10),
        'hotspot.redirect_url': (e.currentTarget.elements.namedItem('redirect') as HTMLInputElement).value,
      }); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Username Prefix</label>
            <Input name="prefix" defaultValue={data['hotspot.username_prefix'] ?? ''} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Hotspot Template</label>
            <Input name="template" defaultValue={data['hotspot.template'] ?? ''} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Prune Inactive Users After</label>
            <Input name="prune" defaultValue={String(data['hotspot.prune_inactive_days'] ?? 14)} />
          </div>
          <div>
            <label className="text-sm text-gray-700">Redirect URL</label>
            <Input name="redirect" defaultValue={data['hotspot.redirect_url'] ?? ''} />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

// Mock data for SMS messages - in production this would come from an API
const mockMessages = [
  { id: 1, user: 'C750', phone: '0719846379', channel: 'SMS', message: 'Dear C750, you have successfully subscribed to GoFiNet 2HR SURF UNLIMITED. Your subscription will expire on 29.01.2026 21:57:43. Your username is C750 and password is 8880.', delivered: true, cost: 0.80, sent: '29.01.2026 19:57' },
  { id: 2, user: 'C729', phone: '0796908187', channel: 'SMS', message: 'Dear C729, you have successfully subscribed to GoFiNet 2HR SURF UNLIMITED. Your subscription will expire on 29.01.2026 18:55:14. Your username is C729 and password is 3757.', delivered: true, cost: 0.80, sent: '29.01.2026 16:55' },
  { id: 3, user: 'C696', phone: '0758603229', channel: 'SMS', message: 'Dear C696, you have successfully subscribed to GoFiNet 2HR SURF UNLIMITED. Your subscription will expire on 29.01.2026 18:43:45. Your username is C696 and password is 5029.', delivered: true, cost: 0.80, sent: '29.01.2026 16:43' },
  { id: 4, user: 'C729', phone: '0796908187', channel: 'SMS', message: 'Dear C729, you have successfully subscribed to GoFiNet 2HR SURF UNLIMITED. Your subscription will expire on 29.01.2026 16:41:33. Your username is C729 and password is 3757.', delivered: true, cost: 0.80, sent: '29.01.2026 14:41' },
  { id: 5, user: 'C19', phone: '0723241220', channel: 'SMS', message: 'Dear C19, you have successfully subscribed to GoFiNet 2HR SURF UNLIMITED. Your subscription will expire on 29.01.2026 14:51:24. Your username is C19 and password is 1163.', delivered: true, cost: 0.80, sent: '29.01.2026 12:51' },
];

function SMSTab() {
  const [activeChannel, setActiveChannel] = useState<'all' | 'sms'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = mockMessages.filter(msg => {
    if (activeChannel === 'sms' && msg.channel !== 'SMS') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return msg.user.toLowerCase().includes(query) ||
             msg.phone.includes(query) ||
             msg.message.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <p className="text-sm text-gray-500">View and filter messages by channel (SMS or WhatsApp), or send new messages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M12 12v5M9 15h6" />
            </svg>
            Top Up SMS
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700 gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Send message
          </Button>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setActiveChannel('all')}
          className={`flex items-center gap-2 py-3 px-1 -mb-px border-b-2 text-sm font-medium transition-colors ${
            activeChannel === 'all'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          All
        </button>
        <button
          onClick={() => setActiveChannel('sms')}
          className={`flex items-center gap-2 py-3 px-1 -mb-px border-b-2 text-sm font-medium transition-colors ${
            activeChannel === 'sms'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
          SMS
        </button>
      </div>

      {/* Messages Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex justify-end">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{msg.user}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{msg.phone}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                      {msg.channel}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                    <p className="line-clamp-3">{msg.message}</p>
                  </td>
                  <td className="px-4 py-4">
                    {msg.delivered ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">KSH {msg.cost.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{msg.sent}</td>
                  <td className="px-4 py-4">
                    <button className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMessages.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No messages found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const { data = {} as any } = useSettings('notifications');
  const save = useSaveSetting('notifications');
  return (
    <Card className="p-6">
      <form id="form-notifications" onSubmit={(e) => { e.preventDefault(); save.mutate({
        'notifications.mikrotik_status_enabled': (e.currentTarget.elements.namedItem('mt') as HTMLInputElement).checked,
        'notifications.payment_hotspot_template': (e.currentTarget.elements.namedItem('tpl_hotspot') as HTMLInputElement).value,
        'notifications.payment_pppoe_template': (e.currentTarget.elements.namedItem('tpl_pppoe') as HTMLInputElement).value,
        'notifications.expiry_hotspot': (e.currentTarget.elements.namedItem('exp_hs') as HTMLInputElement).checked,
        'notifications.expiry_pppoe': (e.currentTarget.elements.namedItem('exp_pppoe') as HTMLInputElement).checked,
        'notifications.reminder_hotspot': (e.currentTarget.elements.namedItem('rem_hs') as HTMLInputElement).checked,
        'notifications.reminder_pppoe': (e.currentTarget.elements.namedItem('rem_pppoe') as HTMLInputElement).checked,
        'notifications.email_subscription_enable': (e.currentTarget.elements.namedItem('email_enable') as HTMLInputElement).checked,
        'notifications.email_subject_pppoe': (e.currentTarget.elements.namedItem('email_subj') as HTMLInputElement).value,
        'notifications.email_template_pppoe': (e.currentTarget.elements.namedItem('email_tpl') as HTMLInputElement).value,
      }); }} className="space-y-4">
        <div className="flex items-center gap-2">
          <input name="mt" type="checkbox" defaultChecked={!!data['notifications.mikrotik_status_enabled']} />
          <span className="text-sm text-gray-700">Enable Mikrotik Status Notifications</span>
        </div>
        <div>
          <label className="text-sm text-gray-700">Hotspot payment confirmation SMS</label>
          <Input name="tpl_hotspot" defaultValue={data['notifications.payment_hotspot_template'] ?? ''} />
        </div>
        <div>
          <label className="text-sm text-gray-700">PPPoE payment confirmation SMS</label>
          <Input name="tpl_pppoe" defaultValue={data['notifications.payment_pppoe_template'] ?? ''} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2"><input name="exp_hs" type="checkbox" defaultChecked={!!data['notifications.expiry_hotspot']} /> <span className="text-sm text-gray-700">Send expiry notifications to hotspot users</span></label>
          <label className="flex items-center gap-2"><input name="exp_pppoe" type="checkbox" defaultChecked={!!data['notifications.expiry_pppoe']} /> <span className="text-sm text-gray-700">Send expiry notifications to PPPoE users</span></label>
          <label className="flex items-center gap-2"><input name="rem_hs" type="checkbox" defaultChecked={!!data['notifications.reminder_hotspot']} /> <span className="text-sm text-gray-700">Send expiry reminder notifications to hotspot users</span></label>
          <label className="flex items-center gap-2"><input name="rem_pppoe" type="checkbox" defaultChecked={!!data['notifications.reminder_pppoe']} /> <span className="text-sm text-gray-700">Send expiry reminder notifications to PPPoE users</span></label>
        </div>
        <div className="border-t pt-4">
          <label className="flex items-center gap-2"><input name="email_enable" type="checkbox" defaultChecked={!!data['notifications.email_subscription_enable']} /> <span className="text-sm text-gray-700">Enable Email Subscription Reminders</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="text-sm text-gray-700">Email Subject for PPPoE Users</label>
              <Input name="email_subj" defaultValue={data['notifications.email_subject_pppoe'] ?? ''} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email Message for PPPoE Users</label>
              <Input name="email_tpl" defaultValue={data['notifications.email_template_pppoe'] ?? ''} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}
