'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AcceptedPaymentsRow } from '@/components/portal/PaymentProviders';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useInitiatePaystackPayment, Invoice } from '@/features/payments/api';
import { useInitiatePlatformInvoicePayment } from '@/features/platform/billing-api';
import { toast } from 'sonner';

interface PaystackPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  userEmail?: string;
  userPhone?: string;
  isPlatformInvoice?: boolean; // Flag to indicate if this is a platform invoice
}

export function PaystackPaymentDialog({
  open,
  onOpenChange,
  invoice,
  userEmail,
  userPhone,
  isPlatformInvoice = false,
}: PaystackPaymentDialogProps) {
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState(userPhone || '');

  // Use different hooks based on invoice type
  const initiateCustomerPayment = useInitiatePaystackPayment();
  const initiatePlatformPayment = useInitiatePlatformInvoicePayment();

  const initiatePayment = isPlatformInvoice ? initiatePlatformPayment : initiateCustomerPayment;

  const handlePayment = async () => {
    if (!invoice) {
      toast.error('No invoice selected');
      return;
    }

    // Get the current origin for callback URL
    const callbackUrl = `${window.location.origin}/payment/callback`;

    try {
      let result;

      if (isPlatformInvoice) {
        // Platform invoice payment - use new endpoint
        result = await initiatePlatformPayment.mutateAsync({
          invoiceId: invoice.id,
          data: {
            callback_url: callbackUrl,
            email: email || 'codevertexitsolutions@gmail.com',
          },
        });
      } else {
        // Customer invoice payment - use existing endpoint
        result = await initiateCustomerPayment.mutateAsync({
          invoice_id: invoice.id,
          callback_url: callbackUrl,
          email: email || 'codevertexitsolutions@gmail.com',
          phone: phone || undefined,
        });
      }

      if (result.success && result.checkout_url) {
        // Redirect to Paystack checkout
        window.location.href = result.checkout_url;
      } else {
        toast.error(result.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            Pay with Paystack
          </DialogTitle>
          <DialogDescription>
            Complete your payment securely with Paystack
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <div className="space-y-4 py-4">
            {/* Invoice Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg text-brand-600">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  placeholder="+254..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                You will be redirected to Paystack&apos;s secure checkout page to complete your payment.
              </p>
            </div>

            {/* Accepted Payment Methods */}
            <div className="pt-2 border-t">
              <AcceptedPaymentsRow />
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={initiatePayment.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={initiatePayment.isPending}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {initiatePayment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Pay {invoice && formatCurrency(invoice.total)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaystackPaymentDialog;
