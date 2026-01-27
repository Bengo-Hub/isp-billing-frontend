'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useHotspotPackages,
    usePaymentStatus,
    usePortalConfig,
    usePurchasePackage,
    type HotspotPackage,
} from '@/features/portal/api';
import { AlertCircle, Check, CheckCircle, Clock, Loader2, Radio, Wifi, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'mpesa', name: 'M-Pesa', logo: 'M' },
];

// Icons based on package characteristics
const getPackageIcon = (pkg: HotspotPackage) => {
  if (pkg.validity_days <= 1) return Clock;
  if (pkg.validity_days <= 7) return Zap;
  if (pkg.is_unlimited_data) return Wifi;
  return Radio;
};

export default function BuyPackagesPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org') || 'default';

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Fetch portal config and packages
  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const { data: packages, isLoading: packagesLoading, error: packagesError } = useHotspotPackages(orgSlug);

  // Purchase mutation
  const purchaseMutation = usePurchasePackage(orgSlug);

  // Payment status polling
  const { data: paymentStatus } = usePaymentStatus(orgSlug, paymentReference || undefined);

  // Handle payment completion
  useEffect(() => {
    if (paymentStatus?.is_completed) {
      if (paymentStatus.status === 'completed') {
        toast.success('Payment successful! You can now connect.');
        if (paymentStatus.voucher_code) {
          toast.info(`Your voucher code: ${paymentStatus.voucher_code}`);
        }
        // Reset state
        setPaymentReference(null);
        setSelectedPackage(null);
        setPhoneNumber('');
      } else if (paymentStatus.status === 'failed') {
        toast.error(paymentStatus.message || 'Payment failed. Please try again.');
        setPaymentReference(null);
      }
    }
  }, [paymentStatus]);

  const handlePurchase = async () => {
    if (!selectedPackage || !phoneNumber) {
      toast.error('Please select a package and enter your phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    try {
      const result = await purchaseMutation.mutateAsync({
        plan_id: selectedPackage,
        phone_number: phoneNumber,
      });

      if (result.success) {
        setPaymentReference(result.reference);
        toast.success(result.message || 'Payment request sent! Check your phone for M-Pesa prompt.');
        if (result.instructions) {
          toast.info(result.instructions);
        }
      } else {
        toast.error(result.message || 'Payment failed. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    }
  };

  const selectedPkg = packages?.find(p => p.id === selectedPackage);
  const isProcessing = purchaseMutation.isPending || !!paymentReference;

  if (configLoading || packagesLoading) {
    return <BuyPackagesSkeleton />;
  }

  if (packagesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Packages</h2>
          <p className="text-gray-600 mb-4">
            Could not connect to the server. Please check your connection and try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const primaryColor = config?.primary_color || '#ec4899';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            {config?.logo_url ? (
              <img src={config.logo_url} alt={config.organization_name} className="h-10" />
            ) : (
              <Wifi className="h-8 w-8" style={{ color: primaryColor }} />
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {config?.portal_title || config?.organization_name || 'WiFi Access'}
              </h1>
              <p className="text-sm text-gray-600">
                {config?.portal_description || 'Select a package to get connected'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Payment Status Banner */}
        {paymentReference && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Processing Payment...</p>
                <p className="text-sm text-blue-700">
                  Reference: {paymentReference} - Please complete the M-Pesa prompt on your phone
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Packages Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Package</h2>

            {packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const Icon = getPackageIcon(pkg);
                  const isSelected = selectedPackage === pkg.id;

                  return (
                    <Card
                      key={pkg.id}
                      className={`p-6 cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-2 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        borderColor: isSelected ? primaryColor : undefined,
                      }}
                      onClick={() => !isProcessing && setSelectedPackage(pkg.id)}
                    >
                      {pkg.is_popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span
                            className="text-white px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Most Popular
                          </span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="rounded-full p-1" style={{ backgroundColor: primaryColor }}>
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <div
                          className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3"
                          style={{ backgroundColor: `${primaryColor}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: primaryColor }} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        {pkg.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                          <span className="text-gray-600 text-sm">{pkg.currency}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Valid for {pkg.validity_days} {pkg.validity_days === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No packages available at the moment</p>
              </Card>
            )}
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>

              {selectedPkg ? (
                <div className="space-y-6">
                  {/* Selected Package Summary */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: `${primaryColor}10` }}>
                    <p className="text-sm text-gray-600 mb-1">Selected Package</p>
                    <p className="font-bold text-gray-900">{selectedPkg.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedPkg.validity_days} {selectedPkg.validity_days === 1 ? 'day' : 'days'} •{' '}
                      {selectedPkg.download_speed} Mbps
                    </p>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: `${primaryColor}30` }}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Amount</span>
                        <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                          {selectedPkg.price} {selectedPkg.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? 'bg-green-50 border-green-500'
                              : 'border-gray-300 hover:border-green-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-green-600"
                            disabled={isProcessing}
                          />
                          <span className="text-2xl font-bold text-green-600 bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
                            {method.logo}
                          </span>
                          <span className="font-medium text-gray-900">{method.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number */}
                  {paymentMethod === 'mpesa' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="0700000000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="text-base"
                        disabled={isProcessing}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        You'll receive an M-Pesa prompt to complete payment
                      </p>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessing || !phoneNumber}
                    className="w-full text-base h-12"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Purchase'
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By purchasing, you agree to our terms of service
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Select a package to continue</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help? Contact support at{' '}
            <a href="mailto:support@example.com" className="hover:underline" style={{ color: primaryColor }}>
              support@example.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

function BuyPackagesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="text-center">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
