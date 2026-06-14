'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateOrganization, useSubscriptionTiers, OrganizationType } from '@/features/platform/api';
import { ArrowLeft, Building, MapPin, Settings, Bell, Palette, Award } from 'lucide-react';
import Link from 'next/link';

export default function NewOrganizationPage() {
  const router = useRouter();
  const createOrg = useCreateOrganization();
  const { data: tiers } = useSubscriptionTiers();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    organization_type: 'hotspot' as OrganizationType,
    country: 'Kenya',
    city: '',
    address: '',
    primary_color: '#9100B0',
    secondary_color: '#b800e0',
    default_currency: 'KES',
    timezone: 'Africa/Nairobi',
    notification_email: '',
    notification_phone: '',
    sms_sender_id: '',
    subscription_tier_id: undefined as number | undefined,
    trial_days: 14,
    max_routers: 5,
    max_customers: 100,
    max_users: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrg.mutateAsync(formData);
      router.push('/platform/organizations');
    } catch {
      // Error handled by mutation
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  // Filter tiers by organization type
  const availableTiers = tiers?.filter(tier => {
    if (formData.organization_type === 'hotspot') return tier.tier_type === 'hotspot';
    if (formData.organization_type === 'pppoe') return tier.tier_type === 'pppoe';
    return true; // hybrid can use either
  }) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/platform/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Organization</h1>
          <p className="text-gray-600">Create a new ISP provider organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My ISP Company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-isp-company"
                pattern="^[a-z0-9-]+$"
              />
              <p className="text-xs text-gray-500 mt-1">Used in URLs: portal.example.com/{formData.slug || 'slug'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.organization_type}
                onChange={(e) => setFormData(prev => ({ ...prev, organization_type: e.target.value as OrganizationType }))}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="hotspot">Hotspot</option>
                <option value="pppoe">PPPoE</option>
                <option value="hybrid">Hybrid (Both)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Location</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Kenya"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Nairobi"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>
          </div>
        </Card>

        {/* Branding */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Branding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#9100B0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#b800e0"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Regional Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Regional Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                value={formData.default_currency}
                onChange={(e) => setFormData(prev => ({ ...prev, default_currency: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="TZS">TZS - Tanzanian Shilling</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Notification Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Email
              </label>
              <Input
                type="email"
                value={formData.notification_email}
                onChange={(e) => setFormData(prev => ({ ...prev, notification_email: e.target.value }))}
                placeholder="notifications@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">For system alerts and reports</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Phone
              </label>
              <Input
                value={formData.notification_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, notification_phone: e.target.value }))}
                placeholder="+254 7XX XXX XXX"
              />
              <p className="text-xs text-gray-500 mt-1">For urgent SMS alerts</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMS Sender ID
              </label>
              <Input
                value={formData.sms_sender_id}
                onChange={(e) => setFormData(prev => ({ ...prev, sms_sender_id: e.target.value }))}
                placeholder="MyISP"
                maxLength={11}
              />
              <p className="text-xs text-gray-500 mt-1">Alphanumeric, max 11 characters</p>
            </div>
          </div>
        </Card>

        {/* Subscription & Limits */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Subscription & Limits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Tier
              </label>
              <select
                value={formData.subscription_tier_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_tier_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">No Tier (Custom Limits)</option>
                {availableTiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} - KES {tier.base_monthly_fee.toLocaleString()}/mo
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a tier or use custom limits below
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trial Days
              </label>
              <Input
                type="number"
                min="0"
                max="90"
                value={formData.trial_days}
                onChange={(e) => setFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 14 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Routers
              </label>
              <Input
                type="number"
                min="1"
                value={formData.max_routers}
                onChange={(e) => setFormData(prev => ({ ...prev, max_routers: parseInt(e.target.value) || 5 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Customers
              </label>
              <Input
                type="number"
                min="1"
                value={formData.max_customers}
                onChange={(e) => setFormData(prev => ({ ...prev, max_customers: parseInt(e.target.value) || 100 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Staff Users
              </label>
              <Input
                type="number"
                min="1"
                value={formData.max_users}
                onChange={(e) => setFormData(prev => ({ ...prev, max_users: parseInt(e.target.value) || 5 }))}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <Link href="/platform/organizations">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={createOrg.isPending}>
            {createOrg.isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}
