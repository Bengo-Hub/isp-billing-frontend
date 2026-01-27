'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateOrganization, OrganizationType } from '@/features/platform/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewOrganizationPage() {
  const router = useRouter();
  const createOrg = useCreateOrganization();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    organization_type: 'hotspot' as OrganizationType,
    country: 'Kenya',
    city: '',
    address: '',
    trial_days: 14,
    max_routers: 5,
    max_customers: 100,
    max_users: 5,
    primary_color: '#ec4899',
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
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
                Slug *
              </label>
              <Input
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="my-isp-company"
                pattern="^[a-z0-9-]+$"
              />
              <p className="text-xs text-gray-500 mt-1">Used in URLs: portal.ispbilling.com/{formData.slug || 'slug'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Type *
              </label>
              <select
                required
                value={formData.organization_type}
                onChange={(e) => setFormData(prev => ({ ...prev, organization_type: e.target.value as OrganizationType }))}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                <option value="hotspot">Hotspot</option>
                <option value="pppoe">PPPoE</option>
                <option value="hybrid">Hybrid (Both)</option>
              </select>
            </div>
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
                  placeholder="#ec4899"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Location</h2>
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

        {/* Limits */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Subscription Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Max Users
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
        <div className="flex items-center justify-end gap-4">
          <Link href="/platform/organizations">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={createOrg.isPending}>
            {createOrg.isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}
