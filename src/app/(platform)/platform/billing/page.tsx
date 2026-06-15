'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Receipt, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import {
  usePlatformBillingStats,
  usePlatformInvoices,
  usePlatformPayments,
  usePlatformWhatsAppSubscriptions,
  type PlatformPayment,
  type PlatformInvoice,
} from '@/features/platform/billing-api';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { StatCard } from '@/components/platform/StatCard';
import { OwnershipNotice } from '@/components/platform/OwnershipNotice';
import { config } from '@/lib/config';

/**
 * Platform Billing — read-only summary.
 *
 * Invoices, payments and refunds are owned by treasury-api. This screen is a
 * concise read-only view of the platform's ISP-provider subscription billing
 * kept for continuity; all create/edit/void/refund actions now live in the
 * treasury console (link-out below).
 */
export default function PlatformBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: statsLoading } = usePlatformBillingStats();
  const { data: invoicesData, isLoading: invoicesLoading } = usePlatformInvoices({
    page: 1,
    page_size: 10,
  });
  const { data: paymentsData, isLoading: paymentsLoading } = usePlatformPayments({
    page: 1,
    page_size: 10,
  });
  const { data: subscriptions, isLoading: subscriptionsLoading } = usePlatformWhatsAppSubscriptions();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-orange-100 text-orange-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Billing</h1>
        <p className="text-gray-600">Read-only summary of ISP-provider subscription billing</p>
      </div>

      {/* Data-ownership notice: invoices, payments and refunds are owned by
          treasury-api. This screen is a read-only continuity view; manage the
          canonical financial ledger in the treasury console. */}
      <OwnershipNotice
        owner="treasury-api"
        description="Invoices, payments and refunds are owned by treasury-api. This screen is a read-only summary of the platform's ISP-provider subscription billing; generate, edit, void and refund in the treasury console."
        manageUrl={config.treasuryUiUrl || undefined}
        manageLabel="Open treasury console"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard inline title="Collected" value={statsLoading ? '…' : formatCurrency(stats?.total_paid || 0, 'KES')} icon={DollarSign} color="green" />
        <StatCard inline title="Total Invoiced" value={statsLoading ? '…' : formatCurrency(stats?.total_invoiced || 0, 'KES')} icon={Receipt} color="blue" />
        <StatCard inline title="Pending" value={statsLoading ? '…' : formatCurrency(stats?.total_pending || 0, 'KES')} icon={Clock} color="orange" />
        <StatCard inline title="Overdue" value={statsLoading ? '…' : formatCurrency(stats?.total_overdue || 0, 'KES')} icon={AlertTriangle} color="red" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Paid Invoices</p>
                <p className="text-2xl font-bold">{stats?.paid_invoice_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Invoices</p>
                <p className="text-2xl font-bold">{stats?.pending_invoice_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue Invoices</p>
                <p className="text-2xl font-bold">{stats?.overdue_invoice_count || 0}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Platform Invoices</h2>
            {invoicesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : invoicesData?.items?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesData.items.map((invoice: PlatformInvoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.organization_name || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(invoice.total_amount, invoice.currency || 'KES')}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{invoice.billing_cycle}</TableCell>
                        <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No invoices found</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Platform Payments</h2>
            {paymentsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : paymentsData?.items?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsData.items.map((payment: PlatformPayment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">#{payment.id}</TableCell>
                        <TableCell>{payment.organization_name || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {payment.transaction_id || '-'}
                        </TableCell>
                        <TableCell>{format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No payments found</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">WhatsApp Subscriptions</h2>
            {subscriptionsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : subscriptions?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Messages (Month)</TableHead>
                      <TableHead>Total Messages</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Next Billing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.organization_name}</TableCell>
                        <TableCell className="capitalize">{sub.provider_type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell>{sub.messages_sent_this_month.toLocaleString()}</TableCell>
                        <TableCell>{sub.total_messages_sent.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(sub.start_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(sub.next_billing_date), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No subscriptions found</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
