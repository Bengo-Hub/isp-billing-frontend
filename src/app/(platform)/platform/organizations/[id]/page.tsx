'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useOrganizations,
  OrganizationStatus,
} from '@/features/platform/api';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  Ban,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Tag,
  Award,
} from 'lucide-react';

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

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orgId = Number(id);

  const { data, isLoading } = useOrganizations({ page_size: 100 });

  const org = data?.items.find((o) => o.id === orgId);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Subscription plans/tiers are owned by subscriptions-api; reference the
  // assigned plan by id here (resolve the name in subscriptions-api).
  const tierName =
    org?.subscription_tier_id != null ? `Plan #${org.subscription_tier_id}` : 'None';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/platform/organizations"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organizations
        </Link>
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : !org ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Organization not found</p>
          <Link href="/platform/organizations">
            <Button variant="link" className="text-brand-600 mt-2">
              Back to Organizations
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-100 rounded-lg flex items-center justify-center">
              {org.logo_url ? (
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="w-7 h-7 text-brand-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
              <p className="text-gray-500">{org.slug}</p>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <div className="flex items-start gap-3 py-3 border-b">
                  {(() => {
                    const StatusIcon = statusIcons[org.status];
                    return <StatusIcon className="w-5 h-5 text-gray-400 mt-0.5" />;
                  })()}
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[org.status]}`}
                    >
                      {org.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <DetailRow icon={Tag} label="Type" value={org.organization_type} />
                <DetailRow icon={Award} label="Subscription Tier" value={tierName} />
              </div>
              <div>
                <DetailRow icon={Mail} label="Email" value={org.email || '-'} />
                <DetailRow icon={Phone} label="Phone" value={org.phone || '-'} />
                <DetailRow icon={Calendar} label="Created" value={formatDate(org.created_at)} />
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
