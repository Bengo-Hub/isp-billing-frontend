'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useLicenceStatus, usePlatformInvoices, type LicenceStatus, type PlatformInvoice } from '@/features/billing/api';
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
import { useAuthStore } from '@/lib/stores/auth-store';
import { PaystackPaymentDialog } from '@/components/payments/PaystackPaymentDialog';
import { type Invoice } from '@/features/payments/api';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MoreVertical,
  RefreshCw,
  Router,
  Search,
  Shield,
  Users,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
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
                  <button onClick={() => { onAction('activate', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Activate
                  </button>
                )}
                {sub.status === 'active' && (
                  <button onClick={() => { onAction('suspend', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <Ban className="h-4 w-4 text-orange-600" /> Suspend
                  </button>
                )}
                {!['cancelled', 'expired'].includes(sub.status) && (
                  <button onClick={() => { onAction('cancel', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" /> Cancel
                  </button>
                )}
                {['expired', 'cancelled'].includes(sub.status) && (
                  <button onClick={() => { onAction('renew', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" /> Renew
                  </button>
                )}
                {!sub.is_router_synced && (
                  <button onClick={() => { onAction('sync', sub); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
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
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(sub.start_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(sub.end_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Data Used</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatBytes(sub.total_bytes_used ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.session_count ?? 0}</p>
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

function LicenceStatusCard({ licence, onRenew, hasPendingInvoices }: { licence: LicenceStatus; onRenew?: () => void; hasPendingInvoices?: boolean }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
    trial: { label: 'Free Trial', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800', icon: Clock },
    active: { label: 'Active', color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800', icon: Shield },
    pending_payment: { label: 'Grace Period', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800', icon: AlertTriangle },
    suspended: { label: 'Suspended', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800', icon: XCircle },
  };

  const config = statusConfig[licence.status] ?? statusConfig.active;
  const StatusIcon = config.icon;

  const expiryDate = licence.is_trial ? licence.trial_ends_at : licence.subscription_ends_at;
  const daysRemaining = licence.is_trial ? licence.trial_days_remaining : licence.subscription_days_remaining;

  return (
    <Card className={`p-5 border-2 ${config.color}`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
        {/* Left side - Plan info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {licence.platform?.logo_url && (
              <Image
                src={licence.platform.logo_url}
                alt={licence.platform.company_name}
                width={32}
                height={32}
                className="rounded"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                {licence.tier?.name ?? 'Platform Licence'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                by {licence.platform?.company_name ?? 'CodeVertex IT Solutions'}
              </p>
            </div>
            <Badge className={`ml-auto ${config.color.split(' ').filter(c => c.startsWith('text-') || c.startsWith('bg-')).join(' ')}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {licence.tier?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{licence.tier.description}</p>
          )}

          {/* Expiry info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {expiryDate && (
              <span className="text-gray-600 dark:text-gray-400">
                {licence.status === 'suspended' ? 'Expired' : 'Expires'}:{' '}
                <strong className="text-gray-900 dark:text-gray-100">
                  {new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </strong>
              </span>
            )}
            {daysRemaining > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </Badge>
            )}
            {licence.tier && (
              <Badge variant="outline" className="text-xs uppercase">
                <Crown className="h-3 w-3 mr-1" />
                {licence.tier.tier_type}
              </Badge>
            )}
          </div>
        </div>

        {/* Right side - Usage meters */}
        <div className="grid grid-cols-3 gap-4 lg:w-72 shrink-0">
          <UsageMeter
            icon={Router}
            label="Routers"
            current={licence.usage?.routers ?? 0}
            max={licence.tier?.max_routers ?? null}
          />
          <UsageMeter
            icon={Users}
            label="Staff"
            current={licence.usage?.staff ?? 0}
            max={licence.tier?.max_staff_users ?? null}
          />
          <UsageMeter
            icon={Users}
            label="Customers"
            current={licence.usage?.customers ?? 0}
            max={null}
          />
        </div>
      </div>

      {/* Action row */}
      {(licence.status === 'suspended' || licence.status === 'pending_payment' || licence.is_trial || (hasPendingInvoices && daysRemaining <= 7)) && (
        <div className="mt-4 pt-4 border-t border-current/10 flex items-center gap-3">
          {licence.status === 'suspended' && (
            <p className="text-sm text-red-600 dark:text-red-400 flex-1">
              Your account is suspended. Renew your subscription to restore access.
            </p>
          )}
          {licence.status === 'pending_payment' && (
            <p className="text-sm text-orange-600 dark:text-orange-400 flex-1">
              Your subscription has expired. You have {licence.grace_period_days} days grace period.
            </p>
          )}
          {licence.is_trial && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex-1">
              Upgrade to a paid plan before your trial ends to keep all features.
            </p>
          )}
          {!licence.is_trial && hasPendingInvoices && daysRemaining <= 7 && licence.status !== 'suspended' && licence.status !== 'pending_payment' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex-1">
              Your subscription is expiring soon. Renew now to avoid service interruption.
            </p>
          )}
          {hasPendingInvoices && onRenew && (
            <Button
              size="sm"
              className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
              onClick={onRenew}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew Subscription
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function UsageMeter({ icon: Icon, label, current, max }: { icon: typeof Router; label: string; current: number; max: number | null }) {
  const percentage = max ? Math.min(100, (current / max) * 100) : 0;
  const isNearLimit = max ? percentage >= 80 : false;

  return (
    <div className="text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${isNearLimit ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`} />
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {current ?? 0}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {max ? `/ ${max} ${label}` : label}
      </p>
      {max && (
        <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-orange-500' : 'bg-green-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PlatformInvoicesSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePlatformInvoices(page, 5);

  if (isLoading) {
    return (
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Invoices</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </Card>
    );
  }

  const invoices = data?.items ?? [];
  const pages = data?.pages ?? 0;

  if (invoices.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform Invoices</h2>
        <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">No platform invoices yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-600" />
          Platform Invoices
        </h2>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Invoice</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Period</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Amount</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">{inv.invoice_number}</td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-xs">
                  {inv.billing_period_start
                    ? `${new Date(inv.billing_period_start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(inv.billing_period_end!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                    : '—'}
                </td>
                <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(inv.total_amount)}
                </td>
                <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{formatDate(inv.due_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
          <p className="text-xs text-gray-500">Page {page} of {pages} · {data?.total ?? 0} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Invoice Detail Modal
// ---------------------------------------------------------------------------
function InvoiceDetailDialog({
  open,
  onOpenChange,
  licence,
  onPayInvoice,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  licence: LicenceStatus | null | undefined;
  onPayInvoice?: (invoice: PlatformInvoice) => void;
}) {
  const { data } = usePlatformInvoices(1, 20, 'pending');
  const pendingInvoices = data?.items ?? [];

  const platform = licence?.platform;
  const orgName = licence?.organization_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-brand-600" />
            View Invoice &amp; Payment Details
          </DialogTitle>
        </DialogHeader>

        {pendingInvoices.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No pending invoices</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All invoices have been settled.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                platform={platform}
                orgName={orgName}
                onPayInvoice={onPayInvoice}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InvoiceCard({
  invoice,
  platform,
  orgName,
  onPayInvoice,
}: {
  invoice: PlatformInvoice;
  platform?: LicenceStatus['platform'];
  orgName?: string;
  onPayInvoice?: (invoice: PlatformInvoice) => void;
}) {
  const lineItems = buildLineItems(invoice);
  const subtotal = lineItems.reduce((s, item) => s + item.total, 0);

  return (
    <div className="border rounded-lg dark:border-gray-700">
      {/* Provider + Invoice meta header */}
      <div className="p-4 sm:p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* FROM - provider */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">From</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{platform?.company_name ?? 'Platform Provider'}</p>
            {platform?.email && <p className="text-sm text-gray-600 dark:text-gray-400">{platform.email}</p>}
            {platform?.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{platform.phone}</p>}
          </div>

          {/* Invoice details */}
          <div className="text-left sm:text-right space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Invoice: <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_number}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Date: <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(invoice.created_at)}</span>
            </p>
            {invoice.due_date && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Due: <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(invoice.due_date)}</span>
              </p>
            )}
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        {/* BILL TO */}
        {orgName && (
          <div className="mt-4 pt-3 border-t dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{orgName}</p>
          </div>
        )}
      </div>

      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-2.5 px-4 font-medium text-gray-600 dark:text-gray-400">Description</th>
              <th className="text-right py-2.5 px-4 font-medium text-gray-600 dark:text-gray-400">Price</th>
              <th className="text-right py-2.5 px-4 font-medium text-gray-600 dark:text-gray-400">Qty</th>
              <th className="text-right py-2.5 px-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx} className="border-b dark:border-gray-800">
                <td className="py-2.5 px-4 text-gray-900 dark:text-gray-100">{item.description}</td>
                <td className="py-2.5 px-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.price)}</td>
                <td className="py-2.5 px-4 text-right text-gray-700 dark:text-gray-300">{item.qty}</td>
                <td className="py-2.5 px-4 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="p-4 sm:p-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Service Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Discount</span>
            <span className="font-medium text-green-600">-{formatCurrency(invoice.discount)}</span>
          </div>
        )}
        {invoice.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(invoice.tax)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Total Due</span>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{formatCurrency(invoice.total_amount)}</span>
        </div>
      </div>

      {/* Pay Now action */}
      {invoice.status === 'pending' && (
        <div className="mx-4 sm:mx-5 mb-4 sm:mb-5">
          {onPayInvoice ? (
            <Button
              className="w-full bg-brand-600 hover:bg-brand-700 text-white"
              onClick={() => onPayInvoice(invoice)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Pay Now — {formatCurrency(invoice.total_amount)}
            </Button>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Payment Not Available</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Online payment for this invoice is not yet available. Please contact {platform?.company_name ?? 'your provider'} for payment instructions.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildLineItems(invoice: PlatformInvoice) {
  const items: { description: string; price: number; qty: number; total: number }[] = [];
  if (invoice.base_fee > 0) {
    items.push({ description: 'Monthly Base Fee', price: invoice.base_fee, qty: 1, total: invoice.base_fee });
  }
  if (invoice.earnings_fee > 0) {
    items.push({ description: 'Earnings Fee', price: invoice.earnings_fee, qty: 1, total: invoice.earnings_fee });
  }
  if (invoice.customer_fee > 0) {
    items.push({ description: 'Customer Fee', price: invoice.customer_fee, qty: 1, total: invoice.customer_fee });
  }
  if (invoice.additional_fees > 0) {
    items.push({ description: 'Additional Fees', price: invoice.additional_fees, qty: 1, total: invoice.additional_fees });
  }
  // If no items were broken out, show total as a single line
  if (items.length === 0 && invoice.total_amount > 0) {
    items.push({ description: 'Platform Subscription', price: invoice.total_amount, qty: 1, total: invoice.total_amount });
  }
  return items;
}

export default function BillingSubscriptionPage() {
  const isSuperuser = useAuthStore((s) => s.user?.role === 'superuser');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<'hotspot' | 'pppoe' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Platform licence status (ISP admins only)
  const { data: licence, isLoading: licenceLoading } = useLicenceStatus({ enabled: !isSuperuser });

  // Pending platform invoices (for renew button visibility)
  const { data: pendingInvoicesData } = usePlatformInvoices(1, 20, 'pending');
  const hasPendingInvoices = (pendingInvoicesData?.items?.length ?? 0) > 0;

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

  function handlePayPlatformInvoice(platformInvoice: PlatformInvoice) {
    // Convert PlatformInvoice to Invoice format for PaystackPaymentDialog
    const invoice: Invoice = {
      id: platformInvoice.id,
      invoice_number: platformInvoice.invoice_number,
      user_id: 0,
      amount: platformInvoice.total_amount - platformInvoice.tax,
      tax: platformInvoice.tax,
      total: platformInvoice.total_amount,
      status: platformInvoice.status as Invoice['status'],
      due_date: platformInvoice.due_date ?? '',
      created_at: platformInvoice.created_at ?? '',
    };
    setSelectedInvoice(invoice);
    setInvoiceModalOpen(false);
    setPaystackModalOpen(true);
  }

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
          <CreditCard className="h-7 w-7 text-brand-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Billing & Subscriptions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage subscriptions and view payment history</p>
          </div>
        </div>
        {!isSuperuser && hasPendingInvoices && (
          <Button
            className="bg-brand-600 hover:bg-brand-700 text-white"
            onClick={() => setInvoiceModalOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Renew Subscription
          </Button>
        )}
      </div>

      {/* Platform Licence Status (ISP admins only) */}
      {!isSuperuser && (
        licenceLoading ? (
          <Skeleton className="h-40" />
        ) : licence ? (
          <LicenceStatusCard
            licence={licence}
            hasPendingInvoices={hasPendingInvoices}
            onRenew={() => setInvoiceModalOpen(true)}
          />
        ) : null
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subscriptions.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{suspendedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Suspended</p>
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
                className="pl-9 pr-3 py-2 border rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 border-gray-300 placeholder-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:placeholder-gray-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as SubscriptionStatus | '')}
              className="px-3 py-2 border rounded-md text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100"
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
              className="px-3 py-2 border rounded-md text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="hotspot">Hotspot</option>
              <option value="pppoe">PPPoE</option>
            </select>
          </div>
        </div>

        {subsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
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

      {/* Platform Invoices (ISP admins only) */}
      {!isSuperuser && <PlatformInvoicesSection />}

      {/* Invoice & Payment Dialogs */}
      <InvoiceDetailDialog
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        licence={licence}
        onPayInvoice={handlePayPlatformInvoice}
      />

      <PaystackPaymentDialog
        open={paystackModalOpen}
        onOpenChange={setPaystackModalOpen}
        invoice={selectedInvoice}
      />

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
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
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
                      <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</td>
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
