'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, ExternalLink, Loader2, CheckCircle2, Smartphone } from 'lucide-react';
import { useInitiatePaystackPayment, useAvailablePaymentGateways, useInitiateMpesaPayment, useMpesaPaymentStatus } from '@/features/payments/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth';
import { api } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';

interface WhatsAppSubscription {
  id: number;
  provider: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  start_date: string;
  end_date: string;
  monthly_fee: number;
  auto_renew: boolean;
}

interface SubscriptionPlan {
  provider: string;
  monthly_fee: number;
  currency: string;
  features: string[];
}

const WHATSAPP_PLANS: SubscriptionPlan[] = [
  {
    provider: 'APIWAP',
    monthly_fee: 500,
    currency: 'KES',
    features: [
      'Unlimited message templates',
      'Delivery reports',
      'Template management',
      'Webhook notifications',
      '24/7 Support',
    ],
  },
];

interface WhatsAppSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Hook to fetch current WhatsApp subscription
function useWhatsAppSubscription() {
  return useQuery({
    queryKey: ['whatsapp-subscription'],
    queryFn: async (): Promise<WhatsAppSubscription | null> => {
      try {
        const { data } = await api.get('/whatsapp/subscription');
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

// Hook to create WhatsApp subscription invoice
function useCreateWhatsAppInvoice() {
  return useMutation({
    mutationFn: async (provider: string) => {
      const { data } = await api.post('/whatsapp/subscription/invoice', { provider });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    },
  });
}

export function WhatsAppSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: WhatsAppSubscriptionDialogProps) {
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const orgSlug = params?.org as string | undefined;
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedPlan] = useState(WHATSAPP_PLANS[0]); // APIWAP is preselected
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState<string | null>(null);

  const { data: currentSubscription, isLoading: loadingSubscription } = useWhatsAppSubscription();
  const { data: availableGateways, isLoading: gatewaysLoading } = useAvailablePaymentGateways();
  const createInvoice = useCreateWhatsAppInvoice();
  const initiatePayment = useInitiatePaystackPayment();
  const initiateMpesa = useInitiateMpesaPayment();
  const { data: mpesaStatus } = useMpesaPaymentStatus(mpesaCheckoutId || undefined);

  // Auto-select Paystack as default payment gateway (primary gateway)
  useEffect(() => {
    if (availableGateways && availableGateways.length > 0 && !selectedPaymentMethod) {
      // Prioritize Paystack as the primary gateway
      const paystackGateway = availableGateways.find(g => g.gateway_type === 'paystack');
      const defaultGateway = paystackGateway || availableGateways.find(g => g.is_selected) || availableGateways[0];
      setSelectedPaymentMethod(defaultGateway.gateway_type);
    }
  }, [availableGateways, selectedPaymentMethod]);

  // Handle M-PESA payment success
  useEffect(() => {
    if (mpesaStatus?.status === 'COMPLETED' || mpesaStatus?.status === 'SUCCESS') {
      toast.success('Payment successful! WhatsApp subscription activated.');
      setMpesaCheckoutId(null);
      onSuccess?.();
      onOpenChange(false);
    } else if (mpesaStatus?.status === 'FAILED' || mpesaStatus?.status === 'CANCELLED') {
      toast.error('Payment failed. Please try again.');
      setMpesaCheckoutId(null);
    }
  }, [mpesaStatus, onSuccess, onOpenChange]);

  const handleSubscribe = async () => {
    const isPaystack = selectedPaymentMethod === 'paystack';
    const isMpesa = selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till';

    // Validate required fields
    if (isMpesa && !phone) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      if (isPaystack) {
        // Paystack flow: Create invoice → Initiate payment → Redirect
        const invoiceResult = await createInvoice.mutateAsync(selectedPlan.provider);

        if (!invoiceResult.invoice_id) {
          toast.error('Failed to create subscription invoice');
          return;
        }

        const orgParam = orgSlug ? `&org=${orgSlug}` : '';
        const callbackUrl = `${window.location.origin}/payment/callback?payment_type=whatsapp_subscription${orgParam}`;

        const paymentResult = await initiatePayment.mutateAsync({
          invoice_id: invoiceResult.invoice_id,
          callback_url: callbackUrl,
          email: 'codevertexitsolutions@gmail.com',
          phone: phone || undefined,
        });

        if (paymentResult.success && paymentResult.checkout_url) {
          // Redirect to Paystack checkout
          window.location.href = paymentResult.checkout_url;
        } else {
          toast.error(paymentResult.error || 'Failed to initiate payment');
        }
      } else if (isMpesa) {
        // M-PESA flow: Initiate STK push → Poll for status
        const mpesaResult = await initiateMpesa.mutateAsync({
          amount: selectedPlan.monthly_fee,
          phone_number: phone,
          account_reference: `WHATSAPP-SUB-${selectedPlan.provider}`,
          description: `WhatsApp API Subscription - ${selectedPlan.provider}`,
        });

        if (mpesaResult.success && mpesaResult.checkout_request_id) {
          setMpesaCheckoutId(mpesaResult.checkout_request_id);
          toast.success(mpesaResult.customer_message || 'Please check your phone for M-PESA prompt');
        } else {
          toast.error(mpesaResult.error || 'Failed to initiate M-PESA payment');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process subscription');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const isActive = currentSubscription?.status === 'active';
  const isPending = createInvoice.isPending || initiatePayment.isPending || initiateMpesa.isPending || !!mpesaCheckoutId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            WhatsApp API Subscription
          </DialogTitle>
          <DialogDescription>
            Subscribe to WhatsApp messaging API via {selectedPlan.provider}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Subscription Status */}
          {loadingSubscription ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : currentSubscription ? (
            <div className={`p-4 rounded-lg border-2 ${isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isActive && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                <h3 className="font-semibold text-gray-900">
                  Current Subscription
                </h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{currentSubscription.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {currentSubscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Renewal:</span>
                  <span className="font-medium">
                    {new Date(currentSubscription.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Subscription Plan Details */}
          <div className="p-4 bg-gradient-to-br from-brand-50 to-brand-100/60 rounded-lg border border-brand-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedPlan.provider}</h3>
                <p className="text-sm text-gray-600">WhatsApp Messaging API</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-600">
                  {formatCurrency(selectedPlan.monthly_fee, selectedPlan.currency)}
                </div>
                <div className="text-xs text-gray-600">per month</div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Features Included:</p>
              {selectedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          {availableGateways && availableGateways.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Payment Method
              </Label>
              <div className="space-y-2">
                {availableGateways.map((gateway) => (
                  <div
                    key={gateway.gateway_type}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === gateway.gateway_type
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(gateway.gateway_type)}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={gateway.gateway_type}
                      checked={selectedPaymentMethod === gateway.gateway_type}
                      onChange={() => setSelectedPaymentMethod(gateway.gateway_type)}
                      className="w-4 h-4 text-brand-600"
                    />
                    {gateway.gateway_type === 'paystack' && <CreditCard className="w-5 h-5 text-blue-600" />}
                    {(gateway.gateway_type === 'mpesa_paybill' || gateway.gateway_type === 'mpesa_till') && (
                      <Smartphone className="w-5 h-5 text-green-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{gateway.name}</p>
                      <p className="text-xs text-gray-500">{gateway.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gatewaysLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading payment methods...</span>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-3">
            {/* Paystack: phone optional */}
            {selectedPaymentMethod === 'paystack' && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </Label>
                <Input
                  type="tel"
                  placeholder="+254..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {/* M-PESA: Phone required */}
            {(selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till') && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  M-PESA Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="07XX XXX XXX or 254XXX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You will receive an STK push on this number
                </p>
              </div>
            )}
          </div>

          {/* Payment Notice */}
          {mpesaCheckoutId ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Waiting for M-PESA payment...
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Please check your phone and complete the payment prompt
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {isActive
                  ? 'Renewing your subscription will extend it by 30 days from the current expiry date.'
                  : selectedPaymentMethod === 'paystack'
                  ? 'You will be redirected to Paystack\'s secure checkout page to complete your payment.'
                  : (selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till')
                  ? 'You will receive an M-PESA STK push to complete payment on your phone.'
                  : 'Select a payment method to continue.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={
              isPending ||
              !selectedPaymentMethod ||
              ((selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till') && !phone)
            }
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mpesaCheckoutId ? 'Waiting for payment...' : 'Processing...'}
              </>
            ) : (
              <>
                {selectedPaymentMethod === 'paystack' ? (
                  <ExternalLink className="h-4 w-4 mr-2" />
                ) : (
                  <Smartphone className="h-4 w-4 mr-2" />
                )}
                {isActive ? 'Renew Subscription' : 'Subscribe Now'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WhatsAppSubscriptionDialog;
