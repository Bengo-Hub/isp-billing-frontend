'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicBrandedLayout } from '@/components/layouts/PublicBrandedLayout';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Receipt, Home } from 'lucide-react';
import { api } from '@/lib/api/api-client';
import Link from 'next/link';

interface PaymentVerificationResult {
  success: boolean;
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  message: string;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    channel?: string;
    customer_email?: string;
  };
}

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentData, setPaymentData] = useState<PaymentVerificationResult['data'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get payment reference from URL params (Paystack sends 'reference' or 'trxref')
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('failed');
        setErrorMessage('No payment reference found');
        return;
      }

      try {
        // Verify payment with backend
        const response = await api.get<PaymentVerificationResult>(
          `/payments/paystack/verify/${reference}`
        );

        if (response.data.success) {
          setStatus('success');
          setPaymentData(response.data.data);
        } else {
          setStatus(response.data.status === 'pending' ? 'pending' : 'failed');
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        // Even if verification fails, show a pending state since payment might still have gone through
        setStatus('pending');
        setErrorMessage('Unable to verify payment status. Please check your email for confirmation.');
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <PublicBrandedLayout showHeader backgroundColor="#ec4899">
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h1>
            <p className="text-gray-500">Please wait while we confirm your payment...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-6">Thank you for your payment. Your transaction has been completed.</p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Transaction Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-gray-900">{paymentData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-gray-900">
                      {paymentData.currency} {paymentData.amount?.toLocaleString()}
                    </span>
                  </div>
                  {paymentData.channel && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="text-gray-900 capitalize">{paymentData.channel}</span>
                    </div>
                  )}
                  {paymentData.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="text-gray-900">
                        {new Date(paymentData.paid_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link href="/dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full">
                  <Receipt className="w-4 h-4 mr-2" />
                  View Billing History
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-6">
              {errorMessage || 'Your payment could not be processed. Please try again.'}
            </p>

            {reference && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-gray-900">{reference}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pending State */}
        {status === 'pending' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Processing</h1>
            <p className="text-gray-500 mb-6">
              {errorMessage || 'Your payment is being processed. You will receive a confirmation email shortly.'}
            </p>

            {reference && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-gray-900">{reference}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link href="/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              If your payment was successful, it may take a few minutes to reflect in your account.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-400">
            Having issues? Contact{' '}
            <a href="mailto:support@ispbilling.com" className="text-blue-600 hover:underline">
              support@ispbilling.com
            </a>
          </p>
        </div>
      </Card>
      </div>
    </PublicBrandedLayout>
  );
}
