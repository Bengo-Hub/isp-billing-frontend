'use client';

import { PublicBrandedLayout } from '@/components/layouts/PublicBrandedLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loginToHotspot, waitForUserReady } from '@/features/portal/connect';
import { api } from '@/lib/api/api-client';
import { ArrowLeft, CheckCircle2, CreditCard, Globe, Home, Loader2, Mail, MessageSquare, Phone, Receipt, Wifi, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  /** MikroTik gateway login URL (http://<gateway>/login?...) so the captive
   *  device can be authenticated onto the hotspot before redirecting. */
  login_url?: string;
}

interface PortalConfig {
  redirect_url?: string;
  organization_name?: string;
  primary_color?: string;
}

type PaymentType = 'hotspot_purchase' | 'pppoe_renewal' | 'billing' | 'platform_subscription' | 'sms_topup' | 'whatsapp_subscription' | null;

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

  // Build org-aware dashboard paths (routes are /{org}/dashboard/...)
  const dashboardPath = (path: string = '') => orgSlug ? `/${orgSlug}/dashboard${path}` : `/dashboard${path}`;

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
        // Accept either the ApiResponse<T> shape or a raw payload (some portal endpoints
        // return plain objects). Normalize both shapes to `payload` below.
        const resp = await api.get<HotspotPaymentStatus>(
          `/portal/hotspot/${slug}/payment/status`,
          { params: { reference: ref } }
        );
        const payload: HotspotPaymentStatus = (resp && (resp as any).data) ? (resp as any).data : (resp as any);

        if (payload && payload.is_completed) return payload;
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

      // For platform subscription payments, use the platform verify endpoint
      if (paymentType === 'platform_subscription') {
        try {
          const response = await api.get<{ success: boolean; status: string; message: string; invoice_id?: number; payment_id?: number }>(
            `/platform/billing/payments/verify/${reference}`
          );

          if (response.data.success) {
            setStatus('success');
            setPaymentData({ reference, amount: 0, currency: 'KES' });
          } else {
            setStatus(response.data.status === 'pending' ? 'pending' : 'failed');
            setErrorMessage(response.data.message);
          }
        } catch {
          setStatus('pending');
          setErrorMessage('Unable to verify payment. Please check your billing dashboard for confirmation.');
        }
        return;
      }

      // For SMS top-up payments, verify via the SMS credit endpoint
      if (paymentType === 'sms_topup') {
        try {
          const response = await api.post<{ success: boolean; message: string; sms_credits?: number; new_balance?: number }>(
            '/sms-credit/verify-paystack-payment',
            { reference }
          );

          if (response.data.success) {
            setStatus('success');
            setPaymentData({ reference, amount: 0, currency: 'KES' });
          } else {
            setStatus('failed');
            setErrorMessage(response.data.message);
          }
        } catch {
          // Auth may have expired or another issue - show pending since webhook will process it
          setStatus('pending');
          setErrorMessage('Your payment is being processed. SMS credits will be added to your account shortly.');
        }
        return;
      }

      // For PPPoE renewals, use the PPPoE-specific verify endpoint (calls Paystack API directly)
      if (paymentType === 'pppoe_renewal' && orgSlug) {
        await fetchPortalConfig(orgSlug);

        try {
          const response = await api.get<PaymentVerificationResult>(
            `/portal/pppoe/${orgSlug}/payment/verify`,
            { params: { reference } }
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
          setErrorMessage('Your payment is being processed. Your subscription will be renewed shortly.');
        }
        return;
      }

      // For WhatsApp subscription, use the billing verify endpoint
      // (billing service handles WhatsApp activation automatically after payment)
      if (paymentType === 'whatsapp_subscription') {
        try {
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
          setErrorMessage('Your payment is being processed. WhatsApp subscription will be activated shortly.');
        }
        return;
      }

      // For billing and other payments, use the Paystack verify endpoint
      try {
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

  // After a successful hotspot purchase we must AUTHENTICATE THE DEVICE onto the
  // MikroTik hotspot (POST creds to the gateway login) BEFORE leaving for the
  // redirect URL. A bare redirect leaves the device unauthenticated, so HTTPS to
  // google is closed by the no-cert hotspot (ERR_CONNECTION_CLOSED). Mirrors the
  // voucher-redeem path. Falls back to a plain redirect only when there is no
  // gateway login (e.g. the page was opened off-network).
  const connectStartedRef = useRef(false);
  const connectDevice = useCallback(() => {
    if (connectStartedRef.current) return;
    const username = hotspotData?.hotspot_username;
    const password = hotspotData?.hotspot_password;
    const loginUrl = hotspotData?.login_url;
    if (username && password && loginUrl && orgSlug) {
      connectStartedRef.current = true;
      (async () => {
        await waitForUserReady(orgSlug, username);
        loginToHotspot(loginUrl, username, password, redirectUrl);
      })();
    } else {
      // No hotspot gateway login available — fall back to a plain redirect.
      setRedirectCountdown(6);
    }
  }, [hotspotData, orgSlug, redirectUrl]);

  useEffect(() => {
    if (status === 'success' && paymentType === 'hotspot_purchase') {
      connectDevice();
    }
  }, [status, paymentType, connectDevice]);

  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return;
    if (redirectCountdown === 1) {
      window.location.href = redirectUrl;
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown(prev => (prev ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, redirectUrl]);

  const primaryColor = '#9100B0';

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

              {/* Success content based on payment type */}
              {paymentType === 'platform_subscription' ? (
                /* Platform Subscription Payment Success */
                <>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">Subscription Payment Successful!</h1>
                  <p className="text-gray-500 mb-6">
                    Your platform subscription invoice has been paid successfully. Thank you!
                  </p>

                  {reference && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Transaction Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reference</span>
                          <span className="font-mono text-gray-900">{reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Link href={dashboardPath('/billing/subscription/')}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Back to Billing
                      </Button>
                    </Link>
                    <Link href={dashboardPath()}>
                      <Button variant="outline" className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </>
              ) : paymentType === 'sms_topup' ? (
                /* SMS Top-up Payment Success */
                <>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">SMS Top-up Successful!</h1>
                  <p className="text-gray-500 mb-6">
                    Your SMS credits have been added to your account successfully.
                  </p>

                  {reference && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Transaction Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reference</span>
                          <span className="font-mono text-gray-900">{reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Link href={dashboardPath('/messages')}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Back to SMS Dashboard
                      </Button>
                    </Link>
                    <Link href={dashboardPath()}>
                      <Button variant="outline" className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </>
              ) : paymentType === 'whatsapp_subscription' ? (
                /* WhatsApp Subscription Payment Success */
                <>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Subscription Activated!</h1>
                  <p className="text-gray-500 mb-6">
                    Your WhatsApp messaging subscription has been activated successfully.
                  </p>

                  {reference && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Transaction Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reference</span>
                          <span className="font-mono text-gray-900">{reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Link href={dashboardPath('/settings')}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Back to Settings
                      </Button>
                    </Link>
                    <Link href={dashboardPath()}>
                      <Button variant="outline" className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </>
              ) : paymentType === 'hotspot_purchase' ? (
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
                      onClick={() => {
                        // Authenticate the device onto the hotspot first (then
                        // MikroTik redirects to the redirect URL); plain redirect
                        // only if there is no gateway login to post to.
                        if (hotspotData?.hotspot_username && hotspotData?.login_url) {
                          connectDevice();
                        } else {
                          window.location.href = redirectUrl;
                        }
                      }}
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
                      <Link href={`/${orgSlug}/portal/pppoe`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Home className="w-4 h-4 mr-2" />
                          Back to Portal
                        </Button>
                      </Link>
                    ) : (
                      <Link href={dashboardPath()}>
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
                    <Link href={dashboardPath()}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link href={dashboardPath('/billing')}>
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
                  <Link href={`/${orgSlug}/portal/hotspot`}>
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : paymentType === 'pppoe_renewal' && orgSlug ? (
                  <Link href={`/${orgSlug}/portal/pppoe`}>
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : paymentType === 'platform_subscription' ? (
                  <Link href={dashboardPath('/billing')}>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Back to Billing
                    </Button>
                  </Link>
                ) : paymentType === 'sms_topup' ? (
                  <Link href={dashboardPath('/messages')}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Back to SMS Dashboard
                    </Button>
                  </Link>
                ) : paymentType === 'whatsapp_subscription' ? (
                  <Link href={dashboardPath('/settings')}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Back to Settings
                    </Button>
                  </Link>
                ) : (
                  <Link href={dashboardPath()}>
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
                  <Link href={`/${orgSlug}/portal/hotspot`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : paymentType === 'pppoe_renewal' && orgSlug ? (
                  <Link href={`/${orgSlug}/portal/pppoe`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Portal
                    </Button>
                  </Link>
                ) : paymentType === 'platform_subscription' ? (
                  <Link href={dashboardPath('/billing')}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Back to Billing
                    </Button>
                  </Link>
                ) : paymentType === 'sms_topup' ? (
                  <Link href={dashboardPath('/messages')}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Back to SMS Dashboard
                    </Button>
                  </Link>
                ) : paymentType === 'whatsapp_subscription' ? (
                  <Link href={dashboardPath('/settings')}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Back to Settings
                    </Button>
                  </Link>
                ) : (
                  <Link href={dashboardPath()}>
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
