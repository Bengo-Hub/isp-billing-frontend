'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePayments, type PaymentItem } from '@/features/payments/api';
import {
  useActivateSubscription,
  useCancelSubscription,
  useRenewSubscription,
  useSubscriptions,
  useSuspendSubscription,
  useSyncSubscription,
  type SubscriptionItem,
  type SubscriptionStatus,
} from '@/features/subscriptions/api';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  MoreVertical,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  suspended: { label: 'Suspended', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  expired: { label: 'Expired', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' };
  return <Badge className={config.className}>{config.label}</Badge>;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(amount: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function SubscriptionCard({ sub, onAction }: { sub: SubscriptionItem; onAction: (action: string, sub: SubscriptionItem) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isExpiringSoon = sub.is_active && sub.end_date && new Date(sub.end_date).getTime() - Date.now() < 7 * 86400000;

  return (
    <Card className="p-5 relative">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {sub.plan_name ?? `Plan #${sub.plan_id}`}
            </h3>
            <StatusBadge status={sub.status} />
            <Badge variant="outline" className="text-xs uppercase">
              {sub.subscription_type}
            </Badge>
            {sub.is_router_synced ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sub.username} · {sub.router_name ?? `Router #${sub.router_id}`}
          </p>
        </div>

        {/* Actions dropdown */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-900 border rounded-lg shadow-lg py-1 min-w-40">
                {sub.status !== 'active' && (
                  <button onClick={() => { onAction('activate', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Activate
                  </button>
                )}
                {sub.status === 'active' && (
                  <button onClick={() => { onAction('suspend', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <Ban className="h-4 w-4 text-orange-600" /> Suspend
                  </button>
                )}
                {!['cancelled', 'expired'].includes(sub.status) && (
                  <button onClick={() => { onAction('cancel', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" /> Cancel
                  </button>
                )}
                {['expired', 'cancelled'].includes(sub.status) && (
                  <button onClick={() => { onAction('renew', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" /> Renew
                  </button>
                )}
                {!sub.is_router_synced && (
                  <button onClick={() => { onAction('sync', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-indigo-600" /> Sync to Router
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
          <p className="text-sm font-medium">{formatDate(sub.start_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
          <p className="text-sm font-medium">{formatDate(sub.end_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Data Used</p>
          <p className="text-sm font-medium">{formatBytes(sub.total_bytes_used ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
          <p className="text-sm font-medium">{sub.session_count ?? 0}</p>
        </div>
      </div>

      {/* Expiry warning */}
      {isExpiringSoon && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            Expires on {formatDate(sub.end_date)} — renew to avoid service interruption.
          </p>
        </div>
      )}
    </Card>
  );
}

export default function BillingSubscriptionPage() {
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<'hotspot' | 'pppoe' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);

  // Live data from API
  const { data: subsData, isLoading: subsLoading, error: subsError } = useSubscriptions({
    status: statusFilter || undefined,
    subscription_type: typeFilter || undefined,
    search: searchQuery || undefined,
    size: 50,
  });

  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    page: paymentPage,
    size: 10,
  });

  const activateMutation = useActivateSubscription();
  const suspendMutation = useSuspendSubscription();
  const cancelMutation = useCancelSubscription();
  const renewMutation = useRenewSubscription();
  const syncMutation = useSyncSubscription();

  const subscriptions = subsData?.subscriptions ?? [];
  const payments = paymentsData?.items ?? [];
  const paymentPages = paymentsData?.pages ?? 0;

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  const suspendedCount = subscriptions.filter(s => s.status === 'suspended').length;

  function handleAction(action: string, sub: SubscriptionItem) {
    switch (action) {
      case 'activate':
        activateMutation.mutate(sub.id);
        break;
      case 'suspend':
        suspendMutation.mutate({ subscriptionId: sub.id, reason: 'Suspended from billing page' });
        break;
      case 'cancel':
        cancelMutation.mutate({ subscriptionId: sub.id, reason: 'Cancelled from billing page' });
        break;
      case 'renew': {
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);
        renewMutation.mutate({ subscriptionId: sub.id, newEndDate: newEnd.toISOString(), notes: 'Renewed from billing page' });
        break;
      }
      case 'sync':
        syncMutation.mutate(sub.id);
        break;
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-pink-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Billing & Subscriptions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage subscriptions and view payment history</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subscriptions.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
          <p className="text-xs text-gray-500">Expired</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{suspendedCount}</p>
          <p className="text-xs text-gray-500">Suspended</p>
        </Card>
      </div>

      {/* Subscriptions section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subscriptions</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as SubscriptionStatus | '')}
              className="px-3 py-2 border rounded-md text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'hotspot' | 'pppoe' | '')}
              className="px-3 py-2 border rounded-md text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">All Types</option>
              <option value="hotspot">Hotspot</option>
              <option value="pppoe">PPPoE</option>
            </select>
          </div>
        </div>

        {subsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
            <span className="ml-2 text-gray-500">Loading subscriptions...</span>
          </div>
        ) : subsError ? (
          <Card className="p-8 text-center">
            <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Failed to load subscriptions</p>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card className="p-8 text-center">
            <CreditCard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No subscriptions found</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map(sub => (
              <SubscriptionCard key={sub.id} sub={sub} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment History</h2>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {paymentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
            <span className="ml-2 text-sm text-gray-500">Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">No payment records found</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Method</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: PaymentItem) => (
                    <tr key={payment.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="py-3 px-3 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell capitalize">{payment.method ?? '—'}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatDate(payment.created_at)}</td>
                      <td className="py-3 px-3"><StatusBadge status={payment.status} /></td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {payment.transaction_id ? (
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{payment.transaction_id}</code>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  Page {paymentPage} of {paymentPages} · {paymentsData?.total ?? 0} total
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={paymentPage <= 1} onClick={() => setPaymentPage(p => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={paymentPage >= paymentPages} onClick={() => setPaymentPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
