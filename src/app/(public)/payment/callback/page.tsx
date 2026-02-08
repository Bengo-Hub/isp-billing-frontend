'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicBrandedLayout } from '@/components/layouts/PublicBrandedLayout';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Receipt, Home, Wifi, Globe, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api/api-client';
import Link from 'next/link';

const SUPPORT_EMAIL = 'support@codevertexitsolutions.com';
const SUPPORT_PHONE = '+254743793901';

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

interface HotspotPaymentStatus {
  status: string;
  is_completed: boolean;
  message: string;
  voucher_code?: string;
  hotspot_username?: string;
  hotspot_password?: string;
}

interface PortalConfig {
  redirect_url?: string;
  organization_name?: string;
  primary_color?: string;
}

type PaymentType = 'hotspot_purchase' | 'pppoe_renewal' | 'billing' | null;

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentData, setPaymentData] = useState<PaymentVerificationResult['data'] | null>(null);
  const [hotspotData, setHotspotData] = useState<HotspotPaymentStatus | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('https://www.google.com');
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');

  // Get params from URL (Paystack appends reference/trxref; we append payment_type and org)
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const paymentType: PaymentType = (searchParams.get('payment_type') as PaymentType) || null;
  const orgSlug = searchParams.get('org');

  // Fetch portal config for hotspot purchases to get redirect URL
  const fetchPortalConfig = useCallback(async (slug: string) => {
    try {
      const { data } = await api.get<PortalConfig>(`/portal/hotspot/${slug}/config`);
      if (data.redirect_url) setRedirectUrl(data.redirect_url);
      if (data.organization_name) setOrgName(data.organization_name);
    } catch {
      // Use defaults
    }
  }, []);

  // Poll hotspot payment status until completed
  const pollHotspotStatus = useCallback(async (slug: string, ref: string): Promise<HotspotPaymentStatus | null> => {
    const maxAttempts = 30; // 30 * 3s = 90s max
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { data } = await api.get<HotspotPaymentStatus>(
          `/portal/hotspot/${slug}/payment/status`,
          { params: { reference: ref } }
        );
        if (data.is_completed) return data;
      } catch {
        // Continue polling
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    return null;
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('failed');
        setErrorMessage('No payment reference found');
        return;
      }

      // For hotspot purchases, use the hotspot-specific status endpoint
      if (paymentType === 'hotspot_purchase' && orgSlug) {
        await fetchPortalConfig(orgSlug);

        const hotspotResult = await pollHotspotStatus(orgSlug, reference);
        if (hotspotResult) {
          setHotspotData(hotspotResult);
          if (hotspotResult.status === 'completed') {
            setStatus('success');
          } else {
            setStatus('failed');
            setErrorMessage(hotspotResult.message || 'Payment failed');
          }
        } else {
          // Polling timed out - payment may still be processing via webhook
          setStatus('pending');
          setErrorMessage('Payment is being processed. Your internet access will be activated shortly.');
        }
        return;
      }

      // For PPPoE and billing payments, use the Paystack verify endpoint
      try {
        if (paymentType === 'pppoe_renewal' && orgSlug) {
          await fetchPortalConfig(orgSlug);
        }

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
      } catch {
        setStatus('pending');
        setErrorMessage('Unable to verify payment status. Please check your email for confirmation.');
      }
    };

    verifyPayment();
  }, [reference, paymentType, orgSlug, fetchPortalConfig, pollHotspotStatus]);

  // Auto-redirect countdown for hotspot purchases after success
  useEffect(() => {
    if (status === 'success' && paymentType === 'hotspot_purchase') {
      setRedirectCountdown(10);
    }
  }, [status, paymentType]);

  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return;
    if (redirectCountdown === 1) {
      window.location.href = redirectUrl;
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown(prev => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, redirectUrl]);

  const primaryColor = '#801066';

  return (
    <PublicBrandedLayout showHeader backgroundColor={primaryColor}>
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

              {/* Hotspot Purchase Success */}
              {paymentType === 'hotspot_purchase' ? (
                <>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">Package Purchased!</h1>
                  <p className="text-gray-500 mb-6">
                    Your internet access has been activated. You can now browse the web.
                  </p>

                  {hotspotData && (hotspotData.hotspot_username || hotspotData.voucher_code) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        Your Credentials
                      </h3>
                      <div className="space-y-2 text-sm">
                        {hotspotData.hotspot_username && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Username</span>
                            <span className="font-mono font-semibold text-gray-900">{hotspotData.hotspot_username}</span>
                          </div>
                        )}
                        {hotspotData.hotspot_password && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Password</span>
                            <span className="font-mono font-semibold text-gray-900">{hotspotData.hotspot_password}</span>
                          </div>
                        )}
                        {hotspotData.voucher_code && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Voucher</span>
                            <span className="font-mono font-semibold text-gray-900">{hotspotData.voucher_code}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => { window.location.href = redirectUrl; }}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Start Browsing
                    </Button>
                  </div>

                  {redirectCountdown !== null && redirectCountdown > 0 && (
                    <p className="text-xs text-gray-400 mt-4">
                      Redirecting in {redirectCountdown} seconds...
                    </p>
                  )}
                </>
              ) : paymentType === 'pppoe_renewal' ? (
                /* PPPoE Renewal Success */
                <>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">Subscription Renewed!</h1>
                  <p className="text-gray-500 mb-6">
                    Your subscription has been renewed successfully.
                    {orgName && ` Thank you for choosing ${orgName}.`}
                  </p>

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
                        {paymentData.paid_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="text-gray-900">
                              {new Date(paymentData.paid_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {orgSlug ? (
                      <Link href={`/portal/pppoe/${orgSlug}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Home className="w-4 h-4 mr-2" />
                          Back to Portal
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Home className="w-4 h-4 mr-2" />
                          Go to Dashboard
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                /* Default / Billing Payment Success */
                <>
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
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
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
                </>
              )}
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
                {paymentType === 'hotspot_purchase' && orgSlug ? (
                  <Link href={`/portal/hotspot/${orgSlug}`}>
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : paymentType === 'pppoe_renewal' && orgSlug ? (
                  <Link href={`/portal/pppoe/${orgSlug}`}>
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
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
                {errorMessage || 'Your payment is being processed. You will receive a confirmation shortly.'}
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
                {paymentType === 'hotspot_purchase' && orgSlug ? (
                  <Link href={`/portal/hotspot/${orgSlug}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : paymentType === 'pppoe_renewal' && orgSlug ? (
                  <Link href={`/portal/pppoe/${orgSlug}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                If your payment was successful, it may take a few minutes to reflect in your account.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center space-y-2">
            <p className="text-xs text-gray-400">
              Having issues? Contact us:
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 hover:underline flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {SUPPORT_EMAIL}
              </a>
              <a href={`tel:${SUPPORT_PHONE}`} className="text-blue-600 hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </Card>
      </div>
    </PublicBrandedLayout>
  );
}
