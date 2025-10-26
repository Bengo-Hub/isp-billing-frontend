'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Editor } from '@/components/ui/editor';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { useSaveSetting, useSettings } from '@/features/settings/api';
import { useGatewayConfig, useSaveGatewayConfig, useTestGateway } from '@/features/settings/gateways';
import { useState } from 'react';

const tabs = [
  { id: 'general', label: 'General Settings' },
  { id: 'payments', label: 'Payments' },
  { id: 'pppoe', label: 'PPPoE' },
  { id: 'hotspot', label: 'Hotspot' },
  { id: 'sms', label: 'SMS Gateway' },
  { id: 'notifications', label: 'Notifications' },
];

export default function SettingsTabs() {
  const [active, setActive] = useState('general');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Button className="bg-pink-600 hover:bg-pink-700" form={`form-${active}`} type="submit">Save changes</Button>
      </div>

      <div className="flex items-center gap-6 border-b">
        {tabs.map((t) => (
          <button key={t.id} className={`py-3 -mb-px border-b-2 text-sm flex items-center gap-2 ${active === t.id ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'}`} onClick={() => setActive(t.id)}>
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

function GeneralTab() {
  const { data = {} as any } = useSettings('system');
  const save = useSaveSetting('system');
  const [logo, setLogo] = useState<string>(data['system.logo_url'] ?? '');
  const [terms, setTerms] = useState<string>(data['system.terms_text'] ?? '');

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
            onFileChange={(file) => {
              if (file) {
                // In a real app, you'd upload to server and get URL
                const reader = new FileReader();
                reader.onload = (e) => {
                  setLogo(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              } else {
                setLogo('');
              }
            }}
          />
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

  // Provider-specific (M-Pesa)
  const { data: mpesa } = useGatewayConfig('payment', 'mpesa');
  const saveMpesa = useSaveGatewayConfig('payment', 'mpesa');
  const testMpesa = useTestGateway('payment', 'mpesa');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form id="form-payments" onSubmit={(e) => { e.preventDefault(); save.mutate({
          'payments.default_gateway': (e.currentTarget.elements.namedItem('gateway') as HTMLInputElement).value,
          'payments.bank_paybill': (e.currentTarget.elements.namedItem('paybill') as HTMLInputElement).value,
          'payments.bank_account_number': (e.currentTarget.elements.namedItem('account') as HTMLInputElement).value,
        }); }} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Payment Gateway</label>
            <Input name="gateway" defaultValue={data['payments.default_gateway'] ?? 'bank'} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Bank Paybill Number</label>
              <Input name="paybill" defaultValue={data['payments.bank_paybill'] ?? ''} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Bank Account Number</label>
              <Input name="account" defaultValue={data['payments.bank_account_number'] ?? ''} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-semibold mb-4">M-Pesa Daraja</div>
        <form onSubmit={(e) => { e.preventDefault();
          const payload: Record<string, string> = {
            consumer_key: (e.currentTarget.elements.namedItem('mpesa_ck') as HTMLInputElement).value || '',
            consumer_secret: (e.currentTarget.elements.namedItem('mpesa_cs') as HTMLInputElement).value || '',
            passkey: (e.currentTarget.elements.namedItem('mpesa_pk') as HTMLInputElement).value || '',
            shortcode: (e.currentTarget.elements.namedItem('mpesa_sc') as HTMLInputElement).value || '',
          };
          saveMpesa.mutate(payload);
        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="mpesa_ck" placeholder="Consumer Key" defaultValue={mpesa?.configuration?.consumer_key ?? ''} />
          <Input name="mpesa_cs" placeholder="Consumer Secret" defaultValue={mpesa?.configuration?.consumer_secret ?? ''} />
          <Input name="mpesa_pk" placeholder="Passkey" defaultValue={mpesa?.configuration?.passkey ?? ''} />
          <Input name="mpesa_sc" placeholder="Shortcode" defaultValue={mpesa?.configuration?.shortcode ?? ''} />
          <div className="col-span-full flex gap-3 justify-end">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => testMpesa.mutate({})}>Test</Button>
          </div>
        </form>
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

function SMSTab() {
  const { data = {} as any } = useSettings('sms');
  const save = useSaveSetting('sms');

  // Providers
  const [smsProvider, setSmsProvider] = useState<'twilio' | 'africastalking'>(data['sms.gateway_provider'] ?? 'twilio');
  const cfg = useGatewayConfig('sms', smsProvider);
  const saveCfg = useSaveGatewayConfig('sms', smsProvider);
  const testCfg = useTestGateway('sms', smsProvider);

  return (
    <div className="space-y-6">
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

      <Card className="p-6">
        <div className="text-sm font-semibold mb-4">{smsProvider === 'twilio' ? 'Twilio' : "Africa's Talking"} Configuration</div>
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
              <Input name="token" placeholder="Auth Token" defaultValue={cfg.data?.configuration?.auth_token ?? ''} />
              <Input name="phone" placeholder="Phone Number" defaultValue={cfg.data?.configuration?.phone_number ?? ''} />
            </>
          ) : (
            <>
              <Input name="at_user" placeholder="Username" defaultValue={cfg.data?.configuration?.username ?? ''} />
              <Input name="at_key" placeholder="API Key" defaultValue={cfg.data?.configuration?.api_key ?? ''} />
            </>
          )}
          <div className="col-span-full flex gap-3 justify-end">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => testCfg.mutate({})}>Test</Button>
          </div>
        </form>
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
