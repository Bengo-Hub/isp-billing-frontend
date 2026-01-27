'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bell, Copy, CreditCard, Globe, Mail, Plug, Settings, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'domain', label: 'Domain', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'paystack', label: 'Paystack', icon: CreditCard },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

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

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900">Platform Integrations</h2>
                <p className="text-sm text-gray-500 mt-1">Configure payment gateways, SMS providers, and other integrations used across all tenants</p>
              </div>

              {/* M-PESA Daraja Configuration */}
              <Card className="p-6 border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">M-Pesa Daraja API</div>
                    <p className="text-xs text-gray-500">Configure M-Pesa payment gateway for all tenants</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Key</label>
                    <Input placeholder="Enter consumer key" type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Secret</label>
                    <Input placeholder="Enter consumer secret" type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passkey</label>
                    <Input placeholder="Enter passkey" type="password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shortcode</label>
                    <Input placeholder="Enter shortcode" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm">
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline">Test Connection</Button>
                  <Button className="bg-green-600 hover:bg-green-700">Save Configuration</Button>
                </div>
              </Card>

              {/* SMS Gateway Configuration */}
              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">SMS Gateway</div>
                    <p className="text-xs text-gray-500">Configure SMS provider for notifications across all tenants</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm">
                      <option value="africastalking">Africa's Talking</option>
                      <option value="twilio">Twilio</option>
                      <option value="custom">Custom Provider</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <Input placeholder="Enter API key" type="password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username/Account SID</label>
                      <Input placeholder="Enter username or SID" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
                      <Input placeholder="Enter sender ID" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline">Send Test SMS</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Configuration</Button>
                </div>
              </Card>

              {/* Integration Webhook URLs */}
              <Card className="p-6 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Plug className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Webhook & Callback URLs</div>
                    <p className="text-xs text-gray-500">Use these URLs when configuring external payment providers</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* M-PESA URLs */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">M-Pesa</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Validation URL</div>
                          <code className="text-xs text-gray-800 break-all">https://api.yourdomain.com/api/v1/integrations/mpesa/validation</code>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('https://api.yourdomain.com/api/v1/integrations/mpesa/validation'); toast.success('Copied!'); }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Confirmation URL</div>
                          <code className="text-xs text-gray-800 break-all">https://api.yourdomain.com/api/v1/integrations/mpesa/confirmation</code>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('https://api.yourdomain.com/api/v1/integrations/mpesa/confirmation'); toast.success('Copied!'); }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Callback URL</div>
                          <code className="text-xs text-gray-800 break-all">https://api.yourdomain.com/api/v1/integrations/mpesa/callback</code>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('https://api.yourdomain.com/api/v1/integrations/mpesa/callback'); toast.success('Copied!'); }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Paystack URLs */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Paystack</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Webhook URL</div>
                          <code className="text-xs text-gray-800 break-all">https://api.yourdomain.com/api/v1/integrations/paystack/webhook</code>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('https://api.yourdomain.com/api/v1/integrations/paystack/webhook'); toast.success('Copied!'); }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Configure these URLs in your payment provider's dashboard under Webhooks/API settings.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'paystack' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-900">Paystack Configuration</h2>
              <p className="text-sm text-gray-500">Configure Paystack for collecting platform subscription fees from ISP providers.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                  <Input placeholder="pk_live_..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                  <Input type="password" placeholder="sk_live_..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <Input type="password" placeholder="whsec_..." />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Test Connection</Button>
                <Button className="bg-pink-600 hover:bg-pink-700">Save Changes</Button>
              </div>
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
