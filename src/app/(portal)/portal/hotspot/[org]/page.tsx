'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useHotspotPackages, usePaymentStatus, usePortalConfig, usePurchasePackage, useRedeemVoucher } from '@/features/portal/api';
import { AlertCircle, CheckCircle, Clock, Loader2, Star, Ticket, Wifi, Zap } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function HotspotPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgSlug = params.org as string;

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [showVoucherForm, setShowVoucherForm] = useState(false);

  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const { data: packages, isLoading: packagesLoading } = useHotspotPackages(orgSlug);
  const purchaseMutation = usePurchasePackage(orgSlug);
  const redeemMutation = useRedeemVoucher(orgSlug);
  const { data: paymentStatus } = usePaymentStatus(orgSlug, paymentReference || undefined);

  // Get MAC address from URL if provided by captive portal
  const macAddress = searchParams.get('mac') || searchParams.get('mac-address');

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(0)} Gbps`;
    }
    return `${speed} Mbps`;
  };

  const formatValidity = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    return days === 1 ? '1 day' : `${days} days`;
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !phoneNumber) return;

    try {
      const result = await purchaseMutation.mutateAsync({
        plan_id: selectedPackage,
        phone_number: phoneNumber,
      });

      if (result.reference) {
        setPaymentReference(result.reference);
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode) return;

    try {
      await redeemMutation.mutateAsync({
        code: voucherCode,
        mac_address: macAddress || undefined,
      });
    } catch {
      // Error handled by mutation
    }
  };

  // Apply organization theme color
  const primaryColor = config?.primary_color || '#ec4899';

  if (configLoading || packagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  // Payment success screen
  if (paymentStatus?.is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: `${primaryColor}10` }}>
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
            <CheckCircle className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your internet access has been activated.</p>

          {paymentStatus.username && paymentStatus.password && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500 mb-2">Your credentials:</p>
              <p className="font-mono text-lg">
                <span className="text-gray-500">Username:</span> {paymentStatus.username}
              </p>
              <p className="font-mono text-lg">
                <span className="text-gray-500">Password:</span> {paymentStatus.password}
              </p>
            </div>
          )}

          {paymentStatus.voucher_code && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500 mb-2">Your voucher code:</p>
              <p className="font-mono text-2xl font-bold" style={{ color: primaryColor }}>
                {paymentStatus.voucher_code}
              </p>
            </div>
          )}

          <Button
            onClick={() => window.location.reload()}
            style={{ backgroundColor: primaryColor }}
            className="hover:opacity-90"
          >
            Connect Again
          </Button>
        </Card>
      </div>
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
          <p className="text-sm text-gray-500">
            Check your phone for the STK push notification.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setPaymentReference(null);
              setSelectedPackage(null);
            }}
          >
            Cancel
          </Button>
        </Card>
      </div>
    );
  }

  // Voucher redemption success
  if (redeemMutation.isSuccess && redeemMutation.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: `${primaryColor}10` }}>
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
            <CheckCircle className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Voucher Redeemed!</h2>
          <p className="text-gray-600 mb-4">{redeemMutation.data.message}</p>
          {redeemMutation.data.plan_name && (
            <p className="text-lg font-medium">{redeemMutation.data.plan_name}</p>
          )}
          {redeemMutation.data.validity_hours && (
            <p className="text-gray-500">Valid for {redeemMutation.data.validity_hours} hours</p>
          )}
          <Button
            onClick={() => window.location.reload()}
            style={{ backgroundColor: primaryColor }}
            className="mt-6 hover:opacity-90"
          >
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: `${primaryColor}10` }}>
      {/* Header */}
      <div className="text-white py-8 px-4" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-4xl mx-auto text-center">
          {config?.logo_url && (
            <img src={config.logo_url} alt={config.organization_name} className="h-16 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold mb-2">
            {config?.portal_title || `${config?.organization_name || 'WiFi'} Hotspot`}
          </h1>
          <p className="text-white/80">
            {config?.portal_description || 'Select a package to get connected'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Toggle between packages and voucher */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={showVoucherForm ? 'outline' : 'default'}
            onClick={() => setShowVoucherForm(false)}
            style={!showVoucherForm ? { backgroundColor: primaryColor } : {}}
          >
            <Wifi className="w-4 h-4 mr-2" />
            Buy Package
          </Button>
          <Button
            variant={showVoucherForm ? 'default' : 'outline'}
            onClick={() => setShowVoucherForm(true)}
            style={showVoucherForm ? { backgroundColor: primaryColor } : {}}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Redeem Voucher
          </Button>
        </div>

        {showVoucherForm ? (
          /* Voucher Redemption Form */
          <Card className="max-w-md mx-auto p-6">
            <h2 className="text-xl font-bold mb-4 text-center">Redeem Voucher</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
                <Input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Enter voucher code"
                  className="text-center text-lg font-mono"
                />
              </div>
              {redeemMutation.isError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Invalid voucher code. Please try again.</span>
                </div>
              )}
              <Button
                onClick={handleRedeemVoucher}
                disabled={!voucherCode || redeemMutation.isPending}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  'Redeem Voucher'
                )}
              </Button>
            </div>
          </Card>
        ) : (
          /* Packages Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages?.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all cursor-pointer ${
                  selectedPackage === pkg.id ? 'ring-2 shadow-lg' : 'hover:shadow-md'
                }`}
                style={{ borderColor: selectedPackage === pkg.id ? primaryColor : undefined }}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.is_popular && (
                  <div
                    className="absolute top-0 right-0 text-white text-xs px-3 py-1 rounded-bl-lg flex items-center gap-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Star className="w-3 h-3" />
                    Popular
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
                  )}

                  <div className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>
                    {formatCurrency(pkg.price, pkg.currency)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatValidity(pkg.validity_days)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Zap className="w-4 h-4" />
                      <span>
                        {formatSpeed(pkg.download_speed)} / {formatSpeed(pkg.upload_speed)}
                      </span>
                    </div>
                    {!pkg.is_unlimited_data && pkg.data_limit > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wifi className="w-4 h-4" />
                        <span>{pkg.data_limit} GB data</span>
                      </div>
                    )}
                    {pkg.is_unlimited_data && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wifi className="w-4 h-4" />
                        <span>Unlimited data</span>
                      </div>
                    )}
                  </div>

                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="mt-4 space-y-1">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <Button
                    variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                    className="w-full"
                    style={selectedPackage === pkg.id ? { backgroundColor: primaryColor } : {}}
                  >
                    {selectedPackage === pkg.id ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Purchase Form */}
        {selectedPackage && !showVoucherForm && (
          <Card className="mt-8 p-6 max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-4">Complete Purchase</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-PESA Phone Number
                </label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XX XXX XXX"
                  type="tel"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You will receive an STK push on this number
                </p>
              </div>

              {purchaseMutation.isError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Payment failed. Please try again.</span>
                </div>
              )}

              <Button
                onClick={handlePurchase}
                disabled={!phoneNumber || purchaseMutation.isPending}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                {purchaseMutation.isPending ? (
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
      </div>
    </div>
  );
}
