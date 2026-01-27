'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Globe, CreditCard, Mail, Bell, Shield } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'domain', label: 'Domain', icon: Globe },
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
