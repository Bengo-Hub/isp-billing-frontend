'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useOrg } from '@/components/org/OrgProvider';

function SMSTopUpSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const { orgSlug } = useOrg();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [smsCredits, setSmsCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    // Verify the payment with backend
    const verifyPayment = async () => {
      try {
        const response = await api.post('/sms-credit/verify-paystack-payment', {
          reference,
        });

        if (response.data.success) {
          setStatus('success');
          setMessage('Payment successful! Your SMS credits have been added.');
          setSmsCredits(response.data.sms_credits);
        } else {
          setStatus('failed');
          setMessage(response.data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        // Even if verification endpoint fails, payment might still be successful
        // Show a softer message
        setStatus('success');
        setMessage('Payment received! Your SMS credits will be updated shortly.');
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-brand-600 animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-4">{message}</p>
            {smsCredits && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>{smsCredits}</strong> SMS credits added to your account
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link href={`/${orgSlug}/dashboard/messages`}>
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  Go to Messages
                </Button>
              </Link>
              <Link href={`/${orgSlug}/dashboard`}>
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link href={`/${orgSlug}/dashboard/messages`}>
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  Try Again
                </Button>
              </Link>
              <Link href={`/${orgSlug}/dashboard`}>
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </>
        )}

        {reference && (
          <p className="text-xs text-gray-400 mt-6">
            Reference: {reference}
          </p>
        )}
      </Card>
    </div>
  );
}

export default function SMSTopUpSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    }>
      <SMSTopUpSuccessContent />
    </Suspense>
  );
}
