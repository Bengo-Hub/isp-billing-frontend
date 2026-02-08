'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, DollarSign, Clock, AlertTriangle, Download, RefreshCw, Eye, Undo2, Loader2 } from 'lucide-react';
import {
  usePlatformBillingStats,
  usePlatformInvoices,
  usePlatformPayments,
  usePlatformWhatsAppSubscriptions,
  useGeneratePlatformInvoices,
  useRefundPayment,
  usePlatformPaymentDetails,
  useExportPlatformData,
  type PlatformPayment,
  type PlatformInvoice,
  type RefundRequest,
} from '@/features/platform/billing-api';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default function PlatformBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PlatformPayment | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Data hooks
  const { data: stats, isLoading: statsLoading } = usePlatformBillingStats();
  const { data: invoicesData, isLoading: invoicesLoading } = usePlatformInvoices({
    page: invoicePage,
    page_size: 10,
  });
  const { data: paymentsData, isLoading: paymentsLoading } = usePlatformPayments({
    page: paymentPage,
    page_size: 10,
  });
  const { data: subscriptions, isLoading: subscriptionsLoading } = usePlatformWhatsAppSubscriptions();
  const { data: paymentDetails, isLoading: detailsLoading } = usePlatformPaymentDetails(
    selectedPayment?.id
  );

  // Mutations
  const generateInvoices = useGeneratePlatformInvoices();
  const refundPayment = useRefundPayment();
  const exportData = useExportPlatformData();

  const handleRefund = async () => {
    if (!selectedPayment) return;

    const refundData: RefundRequest = {
      reason: refundReason,
    };

    if (refundAmount && parseFloat(refundAmount) > 0) {
      refundData.amount = parseFloat(refundAmount);
    }

    await refundPayment.mutateAsync({
      paymentId: selectedPayment.id,
      data: refundData,
    });

    setRefundModalOpen(false);
    setRefundAmount('');
    setRefundReason('');
    setSelectedPayment(null);
  };

  const openRefundModal = (payment: PlatformPayment) => {
    setSelectedPayment(payment);
    setRefundModalOpen(true);
  };

  const openDetailsModal = (payment: PlatformPayment) => {
    setSelectedPayment(payment);
    setDetailsModalOpen(true);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Billing</h1>
          <p className="text-gray-600">Manage invoices and payments from ISP providers</p>
        </div>
        <Button
          onClick={() => generateInvoices.mutate()}
          disabled={generateInvoices.isPending}
          className="bg-brand-600 hover:bg-brand-700"
        >
          {generateInvoices.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Invoices
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Collected</p>
              {statsLoading ? (
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(stats?.total_paid || 0, 'KES')}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoiced</p>
              {statsLoading ? (
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(stats?.total_invoiced || 0, 'KES')}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              {statsLoading ? (
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(stats?.total_pending || 0, 'KES')}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              {statsLoading ? (
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(stats?.total_overdue || 0, 'KES')}
                </p>
              )}
            </div>
          </div>
        </Card>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Platform Invoices</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData.mutate({ type: 'invoices' })}
                disabled={exportData.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
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
                        <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Platform Payments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData.mutate({ type: 'payments' })}
                disabled={exportData.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
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
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailsModal(payment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payment.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRefundModal(payment)}
                              >
                                <Undo2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
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

      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund payment #{selectedPayment?.id}. Leave amount empty for full refund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refund-amount">Refund Amount (Optional)</Label>
              <Input
                id="refund-amount"
                type="number"
                placeholder={`Max: ${selectedPayment?.amount || 0}`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedPayment?.amount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for full refund of {formatCurrency(selectedPayment?.amount || 0, selectedPayment?.currency || 'KES')}
              </p>
            </div>
            <div>
              <Label htmlFor="refund-reason">Reason *</Label>
              <Textarea
                id="refund-reason"
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={!refundReason || refundPayment.isPending}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {refundPayment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Refund'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Payment #{selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : paymentDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Organization</Label>
                  <p className="font-medium">{paymentDetails.organization_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Amount</Label>
                  <p className="font-medium">{formatCurrency(paymentDetails.amount, paymentDetails.currency)}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Method</Label>
                  <p className="font-medium capitalize">{paymentDetails.payment_method}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge className={getStatusColor(paymentDetails.status)}>{paymentDetails.status}</Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Transaction ID</Label>
                  <p className="font-mono text-sm">{paymentDetails.transaction_id || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p className="font-medium">{format(new Date(paymentDetails.created_at), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
              </div>
              {paymentDetails.metadata && Object.keys(paymentDetails.metadata).length > 0 && (
                <div>
                  <Label className="text-gray-500">Metadata</Label>
                  <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(paymentDetails.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No details available</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
