'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Eye, Search, Globe, Download, MoreHorizontal, Banknote } from 'lucide-react';
import { useState } from 'react';
import { usePayments, usePendingInvoices, usePaymentStats, Invoice } from '@/features/payments/api';
import { PaystackPaymentDialog, RecordPaymentDialog } from '@/components/payments';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real data from API
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({ page: 1, size: 20 });
  const { data: pendingInvoicesData, isLoading: invoicesLoading } = usePendingInvoices({ page: 1, size: 20 });
  const { data: paymentStats, isLoading: statsLoading } = usePaymentStats();

  const payments = paymentsData?.items || [];
  const pendingInvoices = pendingInvoicesData?.invoices || [];

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h1>
          <button className="text-gray-400 hover:text-gray-600 shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setActiveTab('invoices')}
          >
            <Globe className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Pay Online</span>
          </Button>
          <Button
            size="sm"
            className="bg-brand-600 hover:bg-brand-700 flex-1 sm:flex-none"
            onClick={() => setShowRecordModal(true)}
          >
            <CreditCard className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Record</span>
          </Button>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Daily Earnings</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              {statsLoading ? 'Loading...' : `Ksh ${(paymentStats?.daily_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total earnings today</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Weekly Earnings</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              {statsLoading ? 'Loading...' : `Ksh ${(paymentStats?.weekly_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total earnings this week</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-400 to-brand-500 text-white">
          <div className="text-sm opacity-90 mb-2">Monthly Earnings</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              {statsLoading ? 'Loading...' : `Ksh ${(paymentStats?.monthly_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <button className="opacity-70 hover:opacity-100">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs opacity-75 mt-2">Total earnings this month</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b overflow-x-auto">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 border-b-2 text-xs sm:text-sm font-medium flex items-center gap-2 shrink-0 ${
              activeTab === 'payments'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            All Payments
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 border-b-2 text-xs sm:text-sm font-medium flex items-center gap-2 shrink-0 ${
              activeTab === 'invoices'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            Pending Invoices ({pendingInvoices.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Payments Table */}
      {activeTab === 'payments' && (
        <Card className="p-3 sm:p-6 w-full">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {paymentsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payments found</div>
              ) : (
                <table className="w-full min-w-[720px]">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="py-3 font-medium text-brand-600">#{payment.id}</td>
                      <td className="py-3 text-sm">{payment.user_id}</td>
                      <td className="py-3 text-sm font-medium">Ksh {payment.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="capitalize">{payment.method}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge className={
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">{new Date(payment.created_at).toLocaleString()}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>
        </Card>
      )}

      {/* Pending Invoices Table */}
      {activeTab === 'invoices' && (
        <Card className="p-3 sm:p-6 w-full">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
            {invoicesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading invoices...</div>
            ) : pendingInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending invoices</div>
            ) : (
              <table className="w-full min-w-[720px]">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">Invoice #</th>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.map((invoice: Invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium text-brand-600">{invoice.invoice_number}</td>
                      <td className="py-3 text-sm">{invoice.user_id}</td>
                      <td className="py-3 text-sm font-medium">Ksh {invoice.total.toFixed(2)}</td>
                      <td className="py-3 text-sm">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Badge className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-brand-600 hover:bg-brand-700"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaystackModal(true);
                            }}
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Pay Online
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowReconcileModal(true);
                            }}
                          >
                            <Banknote className="h-4 w-4 mr-1" />
                            Record Payment
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>
        </Card>
      )}

      {/* Record Payment Dialog (general mode) */}
      <RecordPaymentDialog open={showRecordModal} onOpenChange={setShowRecordModal} />

      {/* Record Payment Dialog (reconcile mode for a specific pending invoice) */}
      <RecordPaymentDialog
        open={showReconcileModal}
        onOpenChange={setShowReconcileModal}
        invoice={selectedInvoice}
      />

      {/* Paystack Payment Dialog */}
      <PaystackPaymentDialog
        open={showPaystackModal}
        onOpenChange={setShowPaystackModal}
        invoice={selectedInvoice}
      />
    </div>
  );
}

