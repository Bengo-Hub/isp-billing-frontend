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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, DollarSign, Clock, AlertTriangle, Download, RefreshCw, Eye, Undo2, Loader2, Edit, Trash2, Ban, RotateCcw, MoreVertical } from 'lucide-react';
import {
  usePlatformBillingStats,
  usePlatformInvoices,
  usePlatformPayments,
  usePlatformWhatsAppSubscriptions,
  useGeneratePlatformInvoices,
  useRefundPayment,
  usePlatformPaymentDetails,
  useExportPlatformData,
  useUpdateInvoice,
  useVoidInvoice,
  useDeleteInvoice,
  useRegenerateInvoice,
  type PlatformPayment,
  type PlatformInvoice,
  type RefundRequest,
  type UpdateInvoiceRequest,
  type VoidInvoiceRequest,
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

  // Invoice management state
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoice | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateDueDate, setUpdateDueDate] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [voidReason, setVoidReason] = useState('');

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
  const updateInvoice = useUpdateInvoice();
  const voidInvoice = useVoidInvoice();
  const deleteInvoice = useDeleteInvoice();
  const regenerateInvoice = useRegenerateInvoice();

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

  // Invoice management handlers
  const openUpdateModal = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setUpdateAmount(invoice.total_amount.toString());
    setUpdateDueDate(invoice.due_date.split('T')[0]);
    setUpdateNotes('');
    setUpdateModalOpen(true);
  };

  const openVoidModal = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setVoidReason('');
    setVoidModalOpen(true);
  };

  const openDeleteModal = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setDeleteModalOpen(true);
  };

  const openRegenerateModal = (invoice: PlatformInvoice) => {
    setSelectedInvoice(invoice);
    setRegenerateModalOpen(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    const updateData: UpdateInvoiceRequest = {};

    if (updateAmount && parseFloat(updateAmount) !== selectedInvoice.total_amount) {
      updateData.amount = parseFloat(updateAmount);
    }

    if (updateDueDate && updateDueDate !== selectedInvoice.due_date.split('T')[0]) {
      updateData.due_date = updateDueDate;
    }

    if (updateNotes) {
      updateData.notes = updateNotes;
    }

    await updateInvoice.mutateAsync({
      invoiceId: selectedInvoice.id,
      data: updateData,
    });

    setUpdateModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleVoidInvoice = async () => {
    if (!selectedInvoice || !voidReason) return;

    const voidData: VoidInvoiceRequest = {
      reason: voidReason,
    };

    await voidInvoice.mutateAsync({
      invoiceId: selectedInvoice.id,
      data: voidData,
    });

    setVoidModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    await deleteInvoice.mutateAsync(selectedInvoice.id);

    setDeleteModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleRegenerateInvoice = async () => {
    if (!selectedInvoice) return;

    await regenerateInvoice.mutateAsync(selectedInvoice.id);

    setRegenerateModalOpen(false);
    setSelectedInvoice(null);
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

  // Check if invoices exist for current billing period (previous month)
  const hasCurrentPeriodInvoices = (): boolean => {
    if (!invoicesData?.items || invoicesData.items.length === 0) return false;

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const billingPeriodEnd = firstOfMonth;
    const billingPeriodStart = new Date(firstOfMonth);
    billingPeriodStart.setMonth(billingPeriodStart.getMonth() - 1);

    // Check if any invoice matches current billing period
    return invoicesData.items.some((invoice: PlatformInvoice) => {
      const invoiceStart = new Date(invoice.billing_period_start);
      const invoiceEnd = new Date(invoice.billing_period_end);
      return (
        invoiceStart.getTime() === billingPeriodStart.getTime() &&
        invoiceEnd.getTime() === billingPeriodEnd.getTime()
      );
    });
  };

  const canGenerateInvoices = !hasCurrentPeriodInvoices() && !generateInvoices.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Billing</h1>
          <p className="text-gray-600">Manage invoices and payments from ISP providers</p>
        </div>
        <div className="relative group">
          <Button
            onClick={() => generateInvoices.mutate()}
            disabled={!canGenerateInvoices}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {!canGenerateInvoices && !generateInvoices.isPending && (
            <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Invoices for current period already generated
            </div>
          )}
        </div>
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
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                                <>
                                  <DropdownMenuItem onClick={() => openUpdateModal(invoice)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Update Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openVoidModal(invoice)}>
                                    <Ban className="w-4 h-4 mr-2" />
                                    Void Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRegenerateModal(invoice)}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Regenerate
                                  </DropdownMenuItem>
                                  {!invoice.paid_at && (
                                    <DropdownMenuItem
                                      onClick={() => openDeleteModal(invoice)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Invoice
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {invoice.status === 'paid' && (
                                <DropdownMenuItem onClick={() => openRegenerateModal(invoice)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Regenerate
                                </DropdownMenuItem>
                              )}
                              {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
                                <DropdownMenuItem
                                  onClick={() => openDeleteModal(invoice)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Invoice
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
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

      {/* Update Invoice Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Invoice</DialogTitle>
            <DialogDescription>
              Update invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="update-amount">Amount</Label>
              <Input
                id="update-amount"
                type="number"
                step="0.01"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="update-due-date">Due Date</Label>
              <Input
                id="update-due-date"
                type="date"
                value={updateDueDate}
                onChange={(e) => setUpdateDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="update-notes">Notes (Optional)</Label>
              <Textarea
                id="update-notes"
                placeholder="Add any notes about this update..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateInvoice}
              disabled={updateInvoice.isPending}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {updateInvoice.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Invoice Modal */}
      <Dialog open={voidModalOpen} onOpenChange={setVoidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Invoice</DialogTitle>
            <DialogDescription>
              Void invoice {selectedInvoice?.invoice_number}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Warning</p>
                  <p className="text-sm text-yellow-700">
                    Voiding this invoice will mark it as cancelled. The invoice cannot be paid after voiding.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="void-reason">Reason *</Label>
              <Textarea
                id="void-reason"
                placeholder="Enter reason for voiding this invoice..."
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVoidInvoice}
              disabled={!voidReason || voidInvoice.isPending}
              variant="destructive"
            >
              {voidInvoice.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Voiding...
                </>
              ) : (
                'Void Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Delete invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Warning</p>
                  <p className="text-sm text-red-700">
                    This will permanently delete the invoice. This action cannot be undone.
                    {selectedInvoice?.paid_at && (
                      <span className="block mt-1 font-medium">
                        Note: This invoice has been paid and should not be deleted without good reason.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Invoice:</span> {selectedInvoice?.invoice_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> {formatCurrency(selectedInvoice?.total_amount || 0, selectedInvoice?.currency || 'KES')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> {selectedInvoice?.status}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteInvoice}
              disabled={deleteInvoice.isPending}
              variant="destructive"
            >
              {deleteInvoice.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Invoice Modal */}
      <Dialog open={regenerateModalOpen} onOpenChange={setRegenerateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Invoice</DialogTitle>
            <DialogDescription>
              Regenerate invoice {selectedInvoice?.invoice_number} with recalculated amounts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Regenerate Invoice</p>
                  <p className="text-sm text-blue-700">
                    This will recalculate the invoice based on current subscription data and update the amount.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Invoice:</span> {selectedInvoice?.invoice_number}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Current Amount:</span> {formatCurrency(selectedInvoice?.total_amount || 0, selectedInvoice?.currency || 'KES')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Organization:</span> {selectedInvoice?.organization_name || 'N/A'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRegenerateInvoice}
              disabled={regenerateInvoice.isPending}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {regenerateInvoice.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
