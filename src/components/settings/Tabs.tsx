'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Input } from '@/components/ui/input';
import { config } from '@/lib/config';
import {
  DEFAULT_TIMEZONE,
  TIMEZONE_OPTIONS,
  useBusinessSettings,
  useHotspotSettings,
  useOrganizationDetails,
  usePPPoESettings,
  useSaveBusinessSettings,
  useSaveHotspotSettings,
  useSaveOrganizationDetails,
  useSavePPPoESettings,
} from '@/features/settings/api';
import { OwnershipNotice } from '@/components/platform/OwnershipNotice';
import { useAuthStore } from '@/lib/store/auth';
import { useOrganization } from '@/features/platform/api';
import { Info, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const tabs = [
  { id: 'general', label: 'General Settings' },
  { id: 'payments', label: 'Payments' },
  { id: 'pppoe', label: 'PPPoE' },
  { id: 'hotspot', label: 'Hotspot' },
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
        {active === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}

function GeneralTab() {
  // Organization name/email/phone/timezone persist to the dedicated
  // /tenant/settings/organization endpoint; legal/business fields (terms, etc.)
  // to /tenant/settings/business. Branding (logo, colors, portal title/welcome)
  // is NO LONGER edited here — it is owned by auth-api (the SoT) and managed in
  // the accounts console; the captive portal reads it server-side. The branding
  // section + its hooks were removed and replaced with an ownership link-out.
  const { data: org } = useOrganizationDetails();
  const saveOrg = useSaveOrganizationDetails();
  const { data: business } = useBusinessSettings();
  const saveBusiness = useSaveBusinessSettings();

  const [terms, setTerms] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [supportEmail, setSupportEmail] = useState<string>('');
  const [supportPhone, setSupportPhone] = useState<string>('');
  const [timezone, setTimezone] = useState<string>(org?.timezone || DEFAULT_TIMEZONE);

  // Sync org name/email/phone form state once organization details load.
  useEffect(() => {
    if (org) {
      setCompanyName(org.name ?? '');
      setSupportEmail(org.email ?? '');
      setSupportPhone(org.phone ?? '');
    }
  }, [org]);

  // Sync legal/business form state once business settings load.
  useEffect(() => {
    if (business) {
      setTerms(business.terms_and_conditions ?? '');
    }
  }, [business]);

  // Sync timezone once the organization details load (default Africa/Nairobi).
  useEffect(() => {
    if (org?.timezone) {
      setTimezone(org.timezone);
    }
  }, [org?.timezone]);

  const isSaving = saveOrg.isPending || saveBusiness.isPending;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Information</h3>
        <form id="form-general" onSubmit={(e) => {
          e.preventDefault();
          // Org name / email / phone / timezone -> organization endpoint.
          saveOrg.mutate({
            name: companyName,
            email: supportEmail,
            phone: supportPhone,
            timezone,
          });
          // Legal/business fields -> business endpoint.
          saveBusiness.mutate({
            terms_and_conditions: terms,
          });
        }} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <Input
              name="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
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
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@yourcompany.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Support Phone</label>
              <Input
                name="phone"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+254 700 000000"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="text-sm font-medium text-gray-700">Timezone</label>
            <select
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {/* Preserve a current value that isn't in the common list. */}
              {timezone && !TIMEZONE_OPTIONS.includes(timezone as (typeof TIMEZONE_OPTIONS)[number]) && (
                <option value={timezone}>{timezone}</option>
              )}
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Used to sync your routers&apos; clock to local time.</p>
          </div>

          {/* Branding & Appearance — centralized in auth-api (accounts console).
              The logo, primary/secondary colors and portal title/welcome are
              owned by auth-api (the SoT) and edited in the accounts console; the
              captive portal reads them server-side. The local branding editor was
              removed, mirroring the retired payout/notifications tabs. */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Branding &amp; Appearance</h4>
            <OwnershipNotice
              owner="auth-api"
              description="Your logo, brand colors and portal title are managed centrally in the accounts console. Update them there once and they apply across your dashboard and customer / captive portal automatically."
              manageUrl={config.accountsUiUrl || undefined}
              manageLabel="Manage branding in accounts"
            />
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
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Payouts and bank-account configuration are centralized in treasury-api /
// treasury-ui. The isp-billing payout config / schedule-type / recipient-type
// endpoints and the Paystack bank-listing endpoint were REMOVED, so this tab no
// longer renders the payout/bank-settings form — it links out to treasury-ui
// where ISPs manage payout schedules and bank accounts. Mirrors how Subscription
// Tiers and the Notifications tab were retired to a centralized owner.
function PaymentsTab() {
  // Prefer the configured treasury-ui URL; fall back to a sensible default host
  // (treasury/books console) when it isn't set in this env.
  const treasuryBase = config.treasuryUiUrl || 'https://books.codevertexitsolutions.com';
  const payoutsUrl = `${treasuryBase}/payouts`;

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Payouts &amp; Bank Accounts</h3>
          <p className="text-sm text-gray-600 mt-1">
            Payout schedules and bank-account configuration are now managed
            centrally in the treasury console. Set up how and when collected
            payments are disbursed, and manage your payout bank accounts, there.
          </p>
        </div>

        <OwnershipNotice
          owner="treasury-ui"
          description="Payout configuration and bank accounts are owned by treasury-api. The payout & bank settings were removed from isp-billing — manage your payout schedule and recipient bank account in the treasury console."
          manageUrl={payoutsUrl}
          manageLabel="Manage payouts in treasury"
        />
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
    auto_suspend_days: 14,
  });

  // Sync form with loaded settings
  useEffect(() => {
    if (settings) {
      setFormData({
        require_username_approval: settings.require_username_approval,
        allow_self_registration: settings.allow_self_registration,
        session_timeout_minutes: settings.session_timeout_minutes,
        auto_disconnect_expired: settings.auto_disconnect_expired,
        auto_suspend_days: settings.auto_suspend_days ?? 14,
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
          <div>
            <label className="text-sm text-gray-700">Auto-suspend / churn after (days)</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={formData.auto_suspend_days}
              onChange={(e) => setFormData({ ...formData, auto_suspend_days: parseInt(e.target.value) || 14 })}
            />
            <p className="text-xs text-gray-500 mt-1">Accounts with no specific package duration are suspended after this many days (default 14).</p>
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

        {/* Voucher Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">Voucher Code Format</label>
            <Input
              value={formData.voucher_format}
              onChange={(e) => setFormData({ ...formData, voucher_format: e.target.value })}
              maxLength={50}
              placeholder="XXXX-XXXX-XXXX"
            />
            <p className="text-xs text-gray-500 mt-1">Pattern for generated voucher codes (e.g., XXXX-XXXX-XXXX)</p>
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium">Voucher Code Length</label>
            <Input
              type="number"
              min={4}
              max={20}
              value={formData.voucher_length}
              onChange={(e) => setFormData({ ...formData, voucher_length: parseInt(e.target.value) || 12 })}
            />
            <p className="text-xs text-gray-500 mt-1">Number of characters in generated voucher codes</p>
          </div>
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

// Notifications & messaging (SMS gateway, WhatsApp subscription, email + the
// per-event notification templates) are centralized in notifications-api /
// notifications-ui. ISP admins manage messaging credits and the WhatsApp
// subscription there; this tab links out instead of driving parallel writes.
function NotificationsTab() {
  const creditsUrl = `${config.notificationsUiUrl}/billing/credits`;
  const whatsappUrl = `${config.notificationsUiUrl}/billing/whatsapp`;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Notifications &amp; Messaging</h3>
        <p className="text-sm text-gray-600 mb-4">
          SMS, email and WhatsApp notifications &mdash; including messaging credits and your
          WhatsApp subscription &mdash; are now managed centrally in the notifications console.
          Configure gateways, templates, credit top-ups and your WhatsApp plan there.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={creditsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Manage SMS credits
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Manage WhatsApp subscription
          </a>
        </div>
      </Card>
    </div>
  );
}
