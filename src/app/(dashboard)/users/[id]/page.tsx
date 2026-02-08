'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser, useDeleteUser, useActivateUser, useDeactivateUser } from '@/features/users/api';
import { useUserSubscriptions, type SubscriptionItem } from '@/features/subscriptions/api';
import { usePayments, type PaymentItem } from '@/features/payments/api';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Edit,
  Loader2,
  Mail,
  MoreVertical,
  Send,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

const TABS = [
  { id: 'general', label: 'General Information' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'payments', label: 'Payments' },
  { id: 'sms', label: 'SMS' },
  { id: 'sessions', label: 'Sessions' },
] as const;

function formatDate(dateString?: string | null) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

const STATUS_MAP: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function StatusBadge({ status }: { status: string }) {
  return <Badge className={STATUS_MAP[status] ?? 'bg-gray-100 text-gray-800'}>{status}</Badge>;
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); }}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

function InfoRow({ label, value, copyable }: { label: string; value?: string | null; copyable?: boolean }) {
  const display = value || '';
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900 dark:text-gray-100">{display}</span>
        {copyable && value && <CopyButton text={value} />}
      </div>
    </div>
  );
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = use(params);
  const numericId = Number(resolvedParams.id);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('general');
  const [showActions, setShowActions] = useState(false);

  const { data: user, isLoading, error } = useUser(numericId);
  const { data: subscriptions } = useUserSubscriptions(numericId);
  const { data: paymentsData } = usePayments({ user_id: numericId, size: 50 });

  const deleteMutation = useDeleteUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const payments = paymentsData?.items ?? [];
  const activeSubs = (subscriptions ?? []).filter((s: SubscriptionItem) => s.is_active);
  const primarySub = activeSubs[0] as SubscriptionItem | undefined;

  const totalDataUsed = (subscriptions ?? []).reduce((acc: number, s: SubscriptionItem) => acc + (s.total_bytes_used ?? 0), 0);
  const totalSessions = (subscriptions ?? []).reduce((acc: number, s: SubscriptionItem) => acc + (s.session_count ?? 0), 0);
  const totalPaid = payments.reduce((acc: number, p: PaymentItem) => p.status === 'completed' ? acc + p.amount : acc, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="h-12 w-12 text-red-400" />
        <p className="text-gray-600 dark:text-gray-400">User not found</p>
        <Link href="/users"><Button variant="outline">Back to Users</Button></Link>
      </div>
    );
  }

  const fullName = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || '';
  const isOnline = user.status === 'active' && user.is_active;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/users" className="mt-1"><ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" /></Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{user.username}</h1>
              <StatusBadge status={user.status} />
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {fullName}  <span className="capitalize">{user.role}</span>
              {primarySub && <>  {primarySub.plan_name ?? `Plan #${primarySub.plan_id}`}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {user.status !== 'active' && (
            <Button variant="outline" size="sm" onClick={() => activateMutation.mutate(numericId)} disabled={activateMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Activate
            </Button>
          )}
          {user.status === 'active' && (
            <Button variant="outline" size="sm" onClick={() => deactivateMutation.mutate(numericId)} disabled={deactivateMutation.isPending}>
              Deactivate
            </Button>
          )}
          <div className="relative">
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700" onClick={() => setShowActions(!showActions)}>
              <MoreVertical className="h-4 w-4 mr-1" /> Actions
            </Button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700 z-20 py-1">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm">
                    <Edit className="h-4 w-4 text-brand-600" /> Edit User
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-brand-600" /> Send Credentials
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm">
                    <Send className="h-4 w-4 text-brand-600" /> Send Voucher
                  </button>
                  <hr className="my-1 dark:border-gray-700" />
                  <button onClick={() => { setShowActions(false); if (confirm('Delete this user?')) { deleteMutation.mutate(numericId, { onSuccess: () => router.push('/users') }); } }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm text-red-600">
                    <Trash2 className="h-4 w-4" /> Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-linear-to-br from-brand-500 to-brand-600 text-white">
          <p className="text-xs opacity-80 mb-1">Subscriptions</p>
          <p className="text-xl font-bold">{(subscriptions ?? []).length}</p>
          <p className="text-xs opacity-70">{activeSubs.length} active</p>
        </Card>
        <Card className="p-4 bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-xs opacity-80 mb-1">Data Used</p>
          <p className="text-xl font-bold">{formatBytes(totalDataUsed)}</p>
          <p className="text-xs opacity-70">{totalSessions} sessions</p>
        </Card>
        <Card className="p-4 bg-linear-to-br from-green-500 to-green-600 text-white">
          <p className="text-xs opacity-80 mb-1">Total Payments</p>
          <p className="text-xl font-bold">{formatCurrency(totalPaid)}</p>
          <p className="text-xs opacity-70">{payments.length} transactions</p>
        </Card>
        <Card className="p-4 bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-xs opacity-80 mb-1">Member Since</p>
          <p className="text-xl font-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}</p>
          <p className="text-xs opacity-70">Last: {user.last_login ? formatDate(user.last_login) : 'Never'}</p>
        </Card>
      </div>

      <div className="border-b dark:border-gray-700">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto -mb-px">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 px-1 border-b-2 text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-brand-600 text-brand-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'general' && (
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow label="User ID" value={String(user.id)} copyable />
            <InfoRow label="Username" value={user.username} copyable />
            <InfoRow label="Full Name" value={fullName} copyable />
            <InfoRow label="Email" value={user.email} copyable />
            <InfoRow label="Phone" value={user.phone} copyable />
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="Status" value={user.status} />
            <InfoRow label="Verified" value={user.is_verified ? 'Yes' : 'No'} />
            <InfoRow label="Created" value={formatDate(user.created_at)} />
            <InfoRow label="Last Login" value={formatDate(user.last_login)} />
            {primarySub && (
              <>
                <InfoRow label="Active Plan" value={primarySub.plan_name ?? `Plan #${primarySub.plan_id}`} />
                <InfoRow label="Type" value={primarySub.subscription_type?.toUpperCase()} />
                <InfoRow label="Expires" value={formatDate(primarySub.end_date)} />
                <InfoRow label="Router Synced" value={primarySub.is_router_synced ? 'Yes' : 'No'} />
              </>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {(subscriptions ?? []).length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No subscriptions found</p>
            </Card>
          ) : (subscriptions ?? []).map((sub: SubscriptionItem) => (
            <Card key={sub.id} className="p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{sub.plan_name ?? `Plan #${sub.plan_id}`}</span>
                <StatusBadge status={sub.status} />
                <Badge variant="outline" className="text-xs uppercase">{sub.subscription_type}</Badge>
                {sub.is_router_synced ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              </div>
              <p className="text-sm text-gray-500 mt-1">{sub.username}  {sub.router_name ?? `Router #${sub.router_id}`}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                <div><p className="text-xs text-gray-500">Start</p><p className="font-medium">{formatDate(sub.start_date)}</p></div>
                <div><p className="text-xs text-gray-500">Expires</p><p className="font-medium">{formatDate(sub.end_date)}</p></div>
                <div><p className="text-xs text-gray-500">Data Used</p><p className="font-medium">{formatBytes(sub.total_bytes_used ?? 0)}</p></div>
                <div><p className="text-xs text-gray-500">Sessions</p><p className="font-medium">{sub.session_count ?? 0}</p></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Payment History</h3>
            <p className="text-xs text-gray-500">Total: {formatCurrency(totalPaid)}</p>
          </div>
          {payments.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-500">No payment records found</p>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4 hidden sm:table-cell">Method</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 hidden md:table-cell">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: PaymentItem) => (
                    <tr key={p.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="py-3 pr-4 font-medium">{formatCurrency(p.amount)}</td>
                      <td className="py-3 pr-4 text-gray-600 capitalize hidden sm:table-cell">{p.method ?? ''}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(p.created_at)}</td>
                      <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3 hidden md:table-cell">{p.transaction_id ? <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{p.transaction_id}</code> : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'sms' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">SMS History</h3>
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700"><Send className="h-4 w-4 mr-1" /> Send SMS</Button>
          </div>
          <div className="py-12 text-center">
            <Mail className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No SMS history for this user</p>
          </div>
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Session Activity</h3>
          {(subscriptions ?? []).some((s: SubscriptionItem) => s.session_count > 0) ? (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="pb-3 pr-4">Subscription</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Upload</th>
                    <th className="pb-3 pr-4">Download</th>
                    <th className="pb-3 pr-4">Last Activity</th>
                    <th className="pb-3">Synced</th>
                  </tr>
                </thead>
                <tbody>
                  {(subscriptions ?? []).filter((s: SubscriptionItem) => s.session_count > 0).map((s: SubscriptionItem) => (
                    <tr key={s.id} className="border-b dark:border-gray-800">
                      <td className="py-3 pr-4 font-medium">{s.plan_name ?? s.username}</td>
                      <td className="py-3 pr-4 uppercase text-xs">{s.subscription_type}</td>
                      <td className="py-3 pr-4">{formatBytes(s.bytes_uploaded ?? 0)}</td>
                      <td className="py-3 pr-4">{formatBytes(s.bytes_downloaded ?? 0)}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(s.last_activity)}</td>
                      <td className="py-3">{s.is_router_synced ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-sm text-gray-500">No active sessions</p>
          )}
        </Card>
      )}
    </div>
  );
}

