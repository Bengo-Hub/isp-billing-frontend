'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServiceUnavailableCard } from '@/components/portal/ServiceUnavailableCard';
import { TermsConditionsModal } from '@/components/portal/TermsConditionsModal';
import { useAuthStore } from '@/lib/store/auth';
import type { ProviderContact } from '@/features/portal/api';
import {
    usePaymentStatus,
    usePortalConfig,
    usePPPoEDashboard,
    usePPPoEPackages,
    usePPPoERenew,
} from '@/features/portal/api';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Download,
    Loader2,
    LogOut,
    RefreshCw,
    Upload,
    Wifi,
    Phone
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PPPoEPortalPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.org as string;

  // Use main authentication system
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  // Set when a renew 403s with code='provider_subscription_inactive'.
  const [providerInactiveContact, setProviderInactiveContact] = useState<ProviderContact | null>(null);

  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = usePPPoEDashboard(orgSlug);
  const { data: packages } = usePPPoEPackages(orgSlug);
  const renewMutation = usePPPoERenew(orgSlug);
  const { data: paymentStatus } = usePaymentStatus(orgSlug, paymentReference || undefined);

  // Payment success - refetch dashboard
  useEffect(() => {
    if (paymentStatus?.is_completed) {
      refetchDashboard();
      setPaymentReference(null);
      setSelectedPackage(null);
    }
  }, [paymentStatus?.is_completed, refetchDashboard]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRenew = async () => {
    if (!selectedPackage || !phoneNumber) return;

    try {
      const result = await renewMutation.mutateAsync({
        plan_id: selectedPackage,
        phone_number: phoneNumber,
      });

      if (result.reference) {
        setPaymentReference(result.reference);
      }
    } catch (err: any) {
      // Provider's own subscription has lapsed → show the customer-safe card.
      const code = err?.code ?? err?.response?.data?.detail?.code;
      if (code === 'provider_subscription_inactive') {
        const contact: ProviderContact | undefined =
          err?.details?.contact ?? err?.response?.data?.detail?.contact;
        setProviderInactiveContact(contact ?? {});
      }
      // Other errors handled by mutation state.
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const primaryColor = config?.primary_color || '#9100B0';

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  // Provider service unavailable — the ISP's own subscription has lapsed. Show
  // the customer-safe "temporarily unavailable" card instead of the renew UI.
  if (config?.provider_active === false || providerInactiveContact) {
    return (
      <ServiceUnavailableCard
        contact={providerInactiveContact ?? config?.provider_contact}
        primaryColor={primaryColor}
        organizationName={config?.organization_name}
      />
    );
  }

  // Payment pending screen
  if (paymentReference && !paymentStatus?.is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: `${primaryColor}10` }}>
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
          <p className="text-gray-600 mb-4">
            Please complete the M-PESA payment on your phone.
          </p>
          <Button
            variant="outline"
            onClick={() => setPaymentReference(null)}
          >
            Cancel
          </Button>
        </Card>
      </div>
    );
  }

  // Dashboard - Protected by AuthGuard in layout
  return (
    <div className="min-h-screen" style={{ backgroundColor: `${primaryColor}10` }}>
      {/* Header */}
      <div className="text-white py-6 px-4" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {config?.logo_url && (
              <img src={config.logo_url} alt={config.organization_name} className="h-10" />
            )}
            <div>
              <h1 className="text-xl font-bold">Welcome, {user?.username || user?.first_name || 'Customer'}</h1>
              <p className="text-white/80 text-sm">{config?.organization_name || 'Customer Portal'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {dashboardLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Current Plan */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Current Package</h2>
                  {dashboard?.current_plan ? (
                    <>
                      <p className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                        {dashboard.current_plan.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Expires: {new Date(dashboard.current_plan.expires_at).toLocaleDateString()}</span>
                      </div>
                      {dashboard.current_plan.is_expired && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Expired</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No active subscription</p>
                  )}
                </div>
                <Button
                  onClick={() => setSelectedPackage(dashboard?.current_plan?.id || packages?.[0]?.id || null)}
                  style={{ backgroundColor: primaryColor }}
                  className="hover:opacity-90"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew
                </Button>
              </div>
            </Card>

            {/* Monthly Usage Chart */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Monthly Internet Usage (GB)</h3>
              <div className="space-y-3">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, index) => {
                  const downloadGb = Math.random() * 50 + 10;
                  const uploadGb = Math.random() * 20 + 5;
                  const maxGb = 80;

                  return (
                    <div key={month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 w-12">{month}</span>
                        <div className="flex-1 mx-3 flex gap-1">
                          <div
                            className="h-8 rounded transition-all"
                            style={{
                              width: `${(downloadGb / maxGb) * 100}%`,
                              backgroundColor: primaryColor
                            }}
                          />
                          <div
                            className="h-8 rounded transition-all"
                            style={{
                              width: `${(uploadGb / maxGb) * 100}%`,
                              backgroundColor: `${primaryColor}80`
                            }}
                          />
                        </div>
                        <span className="text-gray-900 font-medium w-16 text-right">
                          {(downloadGb + uploadGb).toFixed(1)} GB
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
                  <span className="text-gray-600">Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: `${primaryColor}80` }} />
                  <span className="text-gray-600">Upload</span>
                </div>
              </div>
            </Card>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Download className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Downloaded</p>
                    <p className="text-xl font-bold">{formatBytes((dashboard?.usage?.download_gb || 0) * 1024 * 1024 * 1024)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Upload className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="text-xl font-bold">{formatBytes((dashboard?.usage?.upload_gb || 0) * 1024 * 1024 * 1024)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Wifi className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Usage</p>
                    <p className="text-xl font-bold">{formatBytes((dashboard?.usage?.total_gb || 0) * 1024 * 1024 * 1024)}</p>
                    {dashboard?.usage?.limit_gb && dashboard.usage.limit_gb > 0 && (
                      <p className="text-xs text-gray-500">of {dashboard.usage.limit_gb} GB limit</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Renewal Form */}
            {selectedPackage !== null && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Renew Subscription</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Package</label>
                    <select
                      value={selectedPackage || ''}
                      onChange={(e) => setSelectedPackage(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
                    >
                      <option value="">Select a package</option>
                      {packages?.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - {formatCurrency(pkg.price, pkg.currency)} ({pkg.validity_days} days)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Number</label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XX XXX XXX"
                      type="tel"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRenew}
                    disabled={!selectedPackage || !phoneNumber || renewMutation.isPending}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {renewMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${formatCurrency(packages?.find(p => p.id === selectedPackage)?.price || 0)}`
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Recent Payments */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Payments</h3>
              {dashboard?.recent_payments && dashboard.recent_payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-500">Date</th>
                        <th className="text-left py-2 font-medium text-gray-500">Package</th>
                        <th className="text-right py-2 font-medium text-gray-500">Amount</th>
                        <th className="text-right py-2 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recent_payments.map((payment) => (
                        <tr key={payment.id} className="border-b">
                          <td className="py-3">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="py-3">{payment.plan_name}</td>
                          <td className="text-right py-3">{formatCurrency(payment.amount, payment.currency)}</td>
                          <td className="text-right py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No payment history</p>
              )}
            </Card>

            {/* Available Packages */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Available Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages?.map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{pkg.name}</h4>
                    <p className="text-2xl font-bold mt-2" style={{ color: primaryColor }}>
                      {formatCurrency(pkg.price, pkg.currency)}
                    </p>
                    <p className="text-sm text-gray-500">{pkg.validity_days} days</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <p>{pkg.download_speed} Mbps / {pkg.upload_speed} Mbps</p>
                      {pkg.is_unlimited ? (
                        <p>Unlimited data</p>
                      ) : pkg.data_limit > 0 ? (
                        <p>{pkg.data_limit} GB data</p>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Footer with Terms & Conditions */}
            <div className="text-center pt-12 pb-8">
              <p className="text-sm text-gray-600">
                By renewing your subscription, you agree to our{' '}
                <button
                  onClick={() => setTermsModalOpen(true)}
                  className="underline hover:no-underline transition-all"
                  style={{ color: primaryColor }}
                >
                  Terms & Conditions
                </button>
              </p>
              {config?.organization_name && (
                <p className="text-xs text-gray-500 mt-2">
                  &copy; {new Date().getFullYear()} {config.organization_name}. All rights reserved.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Terms & Conditions Modal */}
      <TermsConditionsModal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        orgSlug={orgSlug}
        primaryColor={primaryColor}
      />
    </div>
  );
}
