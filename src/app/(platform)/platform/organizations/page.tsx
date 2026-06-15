'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useOrganizations,
  useSuspendOrganization,
  useReactivateOrganization,
  useExtendOrganization,
  useToggleLicenceBypass,
  useActivateOrganization,
  Organization,
  OrganizationStatus,
  OrganizationType,
} from '@/features/platform/api';
import {
  Building2,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Router,
  CalendarPlus,
  ShieldOff,
  Shield,
  Zap,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OwnershipNotice } from '@/components/platform/OwnershipNotice';
import { config } from '@/lib/config';

const statusColors: Record<OrganizationStatus, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
  pending_payment: 'bg-orange-100 text-orange-700',
};

const statusIcons: Record<OrganizationStatus, any> = {
  active: CheckCircle,
  trial: Clock,
  suspended: Ban,
  pending_payment: AlertTriangle,
};

function OrganizationRow({ org }: { org: Organization }) {
  const suspend = useSuspendOrganization();
  const reactivate = useReactivateOrganization();
  const extend = useExtendOrganization();
  const bypass = useToggleLicenceBypass();
  const activate = useActivateOrganization();

  const StatusIcon = statusIcons[org.status];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount / 100); // Convert from cents
  };

  const handleSuspend = () => {
    if (confirm(`Are you sure you want to suspend ${org.name}?`)) {
      suspend.mutate({ organizationId: org.id });
    }
  };

  const handleReactivate = () => {
    reactivate.mutate(org.id);
  };

  const handleExtend = () => {
    const days = prompt('How many days to extend?', '30');
    if (days && !isNaN(Number(days))) {
      const reason = prompt('Reason for extension (optional):') || undefined;
      extend.mutate({ organizationId: org.id, days: Number(days), reason });
    }
  };

  const handleBypass = () => {
    const currentlyBypassed = (org as any).licence_bypass;
    const action = currentlyBypassed ? 'disable' : 'enable';
    if (confirm(`${action === 'enable' ? 'Enable' : 'Disable'} licence bypass for ${org.name}?`)) {
      const reason = action === 'enable' ? (prompt('Reason for bypass:') || 'Admin override') : undefined;
      bypass.mutate({ organizationId: org.id, enable: !currentlyBypassed, reason });
    }
  };

  const handleActivate = () => {
    const months = prompt('How many months of subscription?', '1');
    if (months && !isNaN(Number(months))) {
      activate.mutate({ organizationId: org.id, months: Number(months) });
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
            {org.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-brand-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{org.name}</p>
            <p className="text-xs text-gray-500">{org.slug}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[org.status]}`}>
          <StatusIcon className="w-3 h-3" />
          {org.status.replace('_', ' ')}
        </span>
        {org.is_trial && org.trial_days_remaining > 0 && (
          <p className="text-xs text-gray-500 mt-1">{org.trial_days_remaining} days left</p>
        )}
      </td>
      <td className="py-4 px-4">
        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {org.organization_type}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{org.total_customers}</span>
        </div>
        <p className="text-xs text-gray-500">{org.active_subscriptions} active</p>
      </td>
      <td className="py-4 px-4">
        <p className="font-medium">{formatCurrency(org.total_revenue)}</p>
        <p className="text-xs text-gray-500">Total revenue</p>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm">{org.email}</p>
        <p className="text-xs text-gray-500">{org.phone || '-'}</p>
      </td>
      <td className="py-4 px-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/platform/organizations/${org.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExtend}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Extend Subscription
            </DropdownMenuItem>
            {(org.status === 'trial' || org.status === 'suspended' || org.status === 'pending_payment') && (
              <DropdownMenuItem onClick={handleActivate} className="text-green-600">
                <Zap className="w-4 h-4 mr-2" />
                Activate Subscription
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleBypass}>
              {(org as any).licence_bypass ? (
                <><Shield className="w-4 h-4 mr-2" />Disable Bypass</>
              ) : (
                <><ShieldOff className="w-4 h-4 mr-2" />Enable Bypass</>
              )}
            </DropdownMenuItem>
            {org.status === 'active' || org.status === 'trial' ? (
              <DropdownMenuItem onClick={handleSuspend} className="text-red-600">
                <Ban className="w-4 h-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            ) : org.status === 'suspended' ? (
              <DropdownMenuItem onClick={handleReactivate} className="text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Reactivate
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<OrganizationType | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrganizations({
    search: search || undefined,
    status: statusFilter || undefined,
    organization_type: typeFilter || undefined,
    page,
    page_size: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600">Manage ISP providers on your platform</p>
        </div>
        <Link href="/platform/organizations/new">
          <Button className="bg-brand-600 hover:bg-brand-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </Link>
      </div>

      {/* Data-ownership notice: tenant IDENTITY (name, slug, email, logo, branding)
          is owned by auth-api. isp-billing owns only the ISP service lifecycle
          (subscription status, trial/extend, licence-bypass) keyed on the tenant
          UUID. Edit identity/branding in the accounts console; the
          subscription/lifecycle actions in this table stay here. */}
      <OwnershipNotice
        owner="auth-api"
        description="Tenant identity & branding (name, slug, email, logo) are owned by auth-api. The subscription lifecycle actions here (activate, extend, suspend, licence bypass) are isp-billing's own; edit tenant identity in the accounts console."
        manageUrl={config.accountsUiUrl || undefined}
        manageLabel="Manage tenants in accounts"
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrganizationStatus | '')}
            className="h-10 px-3 rounded-md border border-gray-300 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="pending_payment">Pending Payment</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as OrganizationType | '')}
            className="h-10 px-3 rounded-md border border-gray-300 text-sm"
          >
            <option value="">All Types</option>
            <option value="hotspot">Hotspot</option>
            <option value="pppoe">PPPoE</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </Card>

      {/* Organizations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Organization</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customers</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((org) => <OrganizationRow key={org.id} org={org} />)
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No organizations found</p>
                    <Link href="/platform/organizations/new">
                      <Button variant="link" className="text-brand-600 mt-2">
                        Add your first organization
                      </Button>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} organizations
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {data.pages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
