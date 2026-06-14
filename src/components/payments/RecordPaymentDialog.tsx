'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Banknote,
  Check,
  Info,
  Loader2,
  Lock,
  Search,
  User as UserIcon,
} from 'lucide-react';
import {
  Invoice,
  PaymentMethod,
  RecordPaymentInput,
  useInvoices,
  useRecordPayment,
} from '@/features/payments/api';
import { UserItem, useUser, useUsers } from '@/features/users/api';
import { cn } from '@/lib/utils';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog opens in reconcile mode locked to this invoice + its customer. */
  invoice?: Invoice | null;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

function userDisplayName(user: UserItem): string {
  const name = user.full_name?.trim() || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return name || user.username || user.email || `User #${user.id}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function RecordPaymentDialog({ open, onOpenChange, invoice }: RecordPaymentDialogProps) {
  const reconcileMode = !!invoice;

  // ---- Controlled form state ----------------------------------------------
  const [userId, setUserId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Customer search (debounced) — only relevant in general mode.
  const [customerSearch, setCustomerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const recordPayment = useRecordPayment();

  // Debounce the customer search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(customerSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  // (Re)initialise the form whenever the dialog opens or the bound invoice changes.
  useEffect(() => {
    if (!open) return;
    if (invoice) {
      setUserId(invoice.user_id);
      setInvoiceId(invoice.id);
      setAmount(String(invoice.total ?? ''));
    } else {
      setUserId(null);
      setInvoiceId(null);
      setAmount('');
    }
    setPaymentMethod('cash');
    setReferenceNumber('');
    setTransactionId('');
    setNotes('');
    setCustomerSearch('');
    setDebouncedSearch('');
    recordPayment.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?.id]);

  // ---- Data ----------------------------------------------------------------
  // Customers list (general mode only). Backend supports a `role` filter.
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    size: 20,
    role: 'customer',
    search: debouncedSearch || undefined,
  });
  const customers = usersData?.users ?? [];

  // Unpaid invoices for the chosen customer (general mode). We merge pending + overdue.
  const { data: pendingData, isLoading: pendingLoading } = useInvoices({
    user_id: userId ?? undefined,
    status: 'pending',
    page: 1,
    size: 50,
  });
  const { data: overdueData, isLoading: overdueLoading } = useInvoices({
    user_id: userId ?? undefined,
    status: 'overdue',
    page: 1,
    size: 50,
  });

  const customerInvoices = useMemo<Invoice[]>(() => {
    if (reconcileMode || !userId) return [];
    const merged = [...(pendingData?.invoices ?? []), ...(overdueData?.invoices ?? [])];
    // Dedupe by id (a backend could surface the same invoice under both filters).
    const seen = new Set<number>();
    return merged.filter((inv) => {
      if (seen.has(inv.id)) return false;
      seen.add(inv.id);
      return true;
    });
  }, [reconcileMode, userId, pendingData, overdueData]);

  const invoicesLoading = !reconcileMode && !!userId && (pendingLoading || overdueLoading);

  const selectedInvoice = useMemo<Invoice | null>(() => {
    if (invoice) return invoice;
    if (invoiceId == null) return null;
    return customerInvoices.find((inv) => inv.id === invoiceId) ?? null;
  }, [invoice, invoiceId, customerInvoices]);

  // The bound customer's display name (for the locked reconcile header). In reconcile mode we
  // resolve the specific user by id; in general mode this query is disabled.
  const { data: boundUser } = useUser(reconcileMode ? invoice!.user_id : 0);
  const reconcileCustomerName = useMemo(() => {
    if (!invoice) return '';
    return boundUser ? userDisplayName(boundUser) : `Customer #${invoice.user_id}`;
  }, [invoice, boundUser]);

  // ---- Handlers ------------------------------------------------------------
  const handleSelectCustomer = (user: UserItem) => {
    setUserId(user.id);
    // Reset invoice + amount when switching customers.
    setInvoiceId(null);
    setAmount('');
  };

  const handleSelectInvoice = (value: string) => {
    if (value === 'none') {
      setInvoiceId(null);
      return;
    }
    const id = Number(value);
    setInvoiceId(id);
    const inv = customerInvoices.find((i) => i.id === id);
    if (inv) setAmount(String(inv.total ?? ''));
  };

  // ---- Validation ----------------------------------------------------------
  const amountNumber = Number(amount);
  const amountValid = amount.trim() !== '' && Number.isFinite(amountNumber) && amountNumber > 0;
  const isValid = userId != null && amountValid && !!paymentMethod;

  const handleSubmit = () => {
    if (!isValid || userId == null) return;

    const payload: RecordPaymentInput = {
      user_id: userId,
      amount: amountNumber,
      payment_method: paymentMethod,
    };
    if (invoiceId != null) payload.invoice_id = invoiceId;
    if (referenceNumber.trim()) payload.reference_number = referenceNumber.trim();
    if (transactionId.trim()) payload.transaction_id = transactionId.trim();
    if (notes.trim()) payload.notes = notes.trim();

    recordPayment.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const isSubmitting = recordPayment.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => (isSubmitting ? undefined : onOpenChange(o))}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-brand-600" />
            {reconcileMode ? 'Record Payment & Activate' : 'Record Payment'}
          </DialogTitle>
          <DialogDescription>
            {reconcileMode
              ? 'Confirm a manual / offline payment for this invoice. This marks it paid and activates the subscription.'
              : 'Record a manual or offline payment received from a customer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Customer */}
          <div className="space-y-2">
            <Label>
              Customer <span className="text-red-500">*</span>
            </Label>

            {reconcileMode ? (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{reconcileCustomerName}</span>
                <Lock className="ml-auto h-3.5 w-3.5 text-gray-400" />
              </div>
            ) : userId != null ? (
              <div className="flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
                <Check className="h-4 w-4 text-brand-600" />
                <span className="font-medium text-gray-900">
                  {(() => {
                    const sel = customers.find((u) => u.id === userId);
                    return sel ? userDisplayName(sel) : `Customer #${userId}`;
                  })()}
                </span>
                <button
                  type="button"
                  className="ml-auto text-xs font-medium text-brand-600 hover:text-brand-700"
                  onClick={() => {
                    setUserId(null);
                    setInvoiceId(null);
                    setAmount('');
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    className="pl-10"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 divide-y">
                  {usersLoading ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      Loading customers...
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No customers found
                    </div>
                  ) : (
                    customers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectCustomer(user)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-brand-50"
                      >
                        <UserIcon className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-gray-900">
                            {userDisplayName(user)}
                          </span>
                          {user.email && (
                            <span className="block truncate text-xs text-gray-500">
                              {user.email}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400">#{user.id}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500">Select the customer who made the payment.</p>
          </div>

          {/* Invoice */}
          <div className="space-y-2">
            <Label>
              Invoice{' '}
              <span className="text-xs font-normal text-gray-500">(recommended)</span>
            </Label>

            {reconcileMode && invoice ? (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium text-brand-600">{invoice.invoice_number}</span>
                <span className="text-gray-500">— {formatCurrency(invoice.total)}</span>
                <Lock className="ml-auto h-3.5 w-3.5 text-gray-400" />
              </div>
            ) : (
              <Select
                value={invoiceId != null ? String(invoiceId) : 'none'}
                onValueChange={handleSelectInvoice}
                disabled={userId == null || invoicesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      userId == null
                        ? 'Select a customer first'
                        : invoicesLoading
                          ? 'Loading invoices...'
                          : 'No invoice (unlinked payment)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No invoice (unlinked payment)</SelectItem>
                  {customerInvoices.map((inv) => (
                    <SelectItem key={inv.id} value={String(inv.id)}>
                      {inv.invoice_number} — {formatCurrency(inv.total)} ({inv.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!reconcileMode && userId != null && !invoicesLoading && customerInvoices.length === 0 && (
              <p className="text-xs text-gray-500">
                This customer has no pending or overdue invoices.
              </p>
            )}

            <div
              className={cn(
                'flex items-start gap-2 rounded-md border px-3 py-2 text-xs',
                selectedInvoice
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-blue-200 bg-blue-50 text-blue-800'
              )}
            >
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Linking an invoice marks it paid and activates the subscription (cash, bank
                transfer, and other methods sync the router automatically).
              </span>
            </div>
          </div>

          {/* Amount + Payment Method */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="record-payment-amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  Ksh
                </span>
                <Input
                  id="record-payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="pl-12"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              {amount.trim() !== '' && !amountValid && (
                <p className="text-xs text-red-500">Enter an amount greater than zero.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference + Transaction ID */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="record-payment-reference">Reference / Receipt Number</Label>
              <Input
                id="record-payment-reference"
                placeholder="e.g. receipt or bank ref"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="record-payment-transaction">
                Transaction ID
                {paymentMethod === 'mpesa' && (
                  <span className="ml-1 text-xs font-normal text-gray-500">(M-Pesa code)</span>
                )}
              </Label>
              <Input
                id="record-payment-transaction"
                placeholder={paymentMethod === 'mpesa' ? 'e.g. SDE4XYZ123' : 'Optional'}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="record-payment-notes">Notes</Label>
            <Textarea
              id="record-payment-notes"
              placeholder="Any additional context for this payment (optional)"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Banknote className="mr-2 h-4 w-4" />
                Record {amountValid ? formatCurrency(amountNumber) : 'Payment'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RecordPaymentDialog;
