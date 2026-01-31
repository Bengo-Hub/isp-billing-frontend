'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PortalBranding,
  PortalFooter,
  PortalHeader,
  DEFAULT_BRANDING,
  getPortalColors,
} from '@/components/portal/PortalBranding';
import {
  PaymentMethodSelector,
  AcceptedPaymentsRow,
} from '@/components/portal/PaymentProviders';
import {
  useHotspotPackages,
  usePaymentStatus,
  usePortalConfig,
  usePurchasePackage,
  type HotspotPackage,
} from '@/features/portal/api';
import { AlertCircle, Check, Clock, Loader2, Sparkles, Wifi, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Icons based on package characteristics
const getPackageIcon = (pkg: HotspotPackage) => {
  if (pkg.validity_days <= 1 && pkg.time_limit && pkg.time_limit > 0) return Clock;
  if (pkg.validity_days <= 1) return Zap;
  if (pkg.validity_days <= 7) return Sparkles;
  return Wifi;
};

// Format data limit
const formatDataLimit = (limitMB: number) => {
  if (limitMB < 0 || limitMB === -1) return 'Unlimited';
  if (limitMB < 1024) return `${limitMB} MB`;
  return `${(limitMB / 1024).toFixed(limitMB % 1024 === 0 ? 0 : 1)} GB`;
};

// Format validity
const formatValidity = (days: number, timeLimit?: number) => {
  if (timeLimit && timeLimit > 0) {
    return timeLimit === 1 ? '1 hour' : `${timeLimit} hours`;
  }
  if (days < 1) return 'Same day';
  if (days === 1) return '1 day';
  if (days === 7) return '1 week';
  if (days === 30) return '1 month';
  return `${days} days`;
};

export default function BuyPackagesPage() {
  const params = useParams();
  const orgSlug = (params.orgSlug as string) || 'default';

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Fetch portal config and packages
  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const { data: packages, isLoading: packagesLoading, error: packagesError } = useHotspotPackages(orgSlug);

  // Purchase mutation
  const purchaseMutation = usePurchasePackage(orgSlug);

  // Payment status polling
  const { data: paymentStatus } = usePaymentStatus(orgSlug, paymentReference || undefined);

  // Get colors
  const colors = getPortalColors(config);

  // Handle payment completion
  useEffect(() => {
    if (paymentStatus?.is_completed) {
      if (paymentStatus.status === 'completed') {
        toast.success('Payment successful! You can now connect.');
        if (paymentStatus.voucher_code) {
          toast.info(`Your voucher code: ${paymentStatus.voucher_code}`);
        }
        setPaymentReference(null);
        setSelectedPackage(null);
        setEmail('');
      } else if (paymentStatus.status === 'failed') {
        toast.error(paymentStatus.message || 'Payment failed. Please try again.');
        setPaymentReference(null);
      }
    }
  }, [paymentStatus]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const result = await purchaseMutation.mutateAsync({
        plan_id: selectedPackage,
        phone_number: '',
        email: email,
        payment_method: 'paystack',
      });

      if (result.success) {
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
          return;
        }
        setPaymentReference(result.reference);
        toast.success(result.message || 'Payment initiated!');
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Packages</h2>
          <p className="text-gray-600 mb-4">
            Could not connect to the server. Please check your connection and try again.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <PortalHeader config={config} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Payment Processing Banner */}
        {paymentReference && (
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-blue-900 text-sm sm:text-base">Processing Payment...</p>
                <p className="text-xs sm:text-sm text-blue-700 truncate">Ref: {paymentReference}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Mobile: Single column, Desktop: Two columns */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Packages Section */}
          <div className="flex-1 lg:flex-[2]">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Choose Your Package</h2>

            {packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {packages.map((pkg) => {
                  const Icon = getPackageIcon(pkg);
                  const isSelected = selectedPackage === pkg.id;

                  return (
                    <Card
                      key={pkg.id}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected ? 'ring-2 shadow-lg' : 'hover:shadow-md active:scale-[0.98]'
                      }`}
                      style={{
                        ringColor: isSelected ? colors.primary : undefined,
                      }}
                      onClick={() => !isProcessing && setSelectedPackage(pkg.id)}
                    >
                      {/* Popular Badge */}
                      {pkg.is_popular && (
                        <div
                          className="absolute top-0 right-0 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg font-medium"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Popular
                        </div>
                      )}

                      {/* Selected Checkmark */}
                      {isSelected && (
                        <div
                          className="absolute top-2 left-2 sm:top-3 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      )}

                      <div className="p-3 sm:p-5">
                        {/* Icon and Name */}
                        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: colors.primaryMedium }}
                          >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colors.primary }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{pkg.name}</h3>
                            {pkg.description && (
                              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 sm:line-clamp-2">{pkg.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{formatDataLimit(pkg.data_limit)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{formatValidity(pkg.validity_days, pkg.time_limit)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{pkg.download_speed} Mbps</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="pt-2 sm:pt-3 border-t">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-bold" style={{ color: colors.primary }}>
                              {pkg.currency} {pkg.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 sm:p-12 text-center">
                <Wifi className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No packages available at the moment</p>
              </Card>
            )}
          </div>

          {/* Payment Section - Only show when package is selected */}
          {selectedPkg && (
            <div className="lg:flex-1 mt-6 lg:mt-0">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Details</h2>

                <div className="space-y-4 sm:space-y-6">
                  {/* Selected Package Summary */}
                  <div
                    className="rounded-xl p-3 sm:p-4"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Selected Package</p>
                    <p className="font-bold text-gray-900 text-base sm:text-lg">{selectedPkg.name}</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                      <span>{formatValidity(selectedPkg.validity_days, selectedPkg.time_limit)}</span>
                      <span>•</span>
                      <span>{formatDataLimit(selectedPkg.data_limit)}</span>
                    </div>
                    <div
                      className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex justify-between items-center"
                      style={{ borderColor: colors.primaryMedium }}
                    >
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Total</span>
                      <span className="text-xl sm:text-2xl font-bold" style={{ color: colors.primary }}>
                        {selectedPkg.currency} {selectedPkg.price}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Display */}
                  <PaymentMethodSelector
                    disabled={isProcessing}
                    primaryColor={colors.primary}
                  />

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-base h-11 sm:h-12"
                      disabled={isProcessing}
                    />
                    <p className="mt-1.5 text-[10px] sm:text-xs text-gray-500">
                      You&apos;ll be redirected to Paystack to complete payment
                    </p>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessing || !email}
                    className="w-full text-sm sm:text-base h-11 sm:h-12 font-semibold"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay {selectedPkg.currency} {selectedPkg.price}</>
                    )}
                  </Button>

                  {/* Accepted Payments */}
                  <AcceptedPaymentsRow className="pt-2" />

                  <p className="text-[10px] sm:text-xs text-gray-400 text-center">
                    By purchasing, you agree to our terms of service
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <PortalFooter config={config} showPoweredBy={true} />
    </div>
  );
}

function BuyPackagesSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Skeleton className="h-10 w-24 sm:h-14 sm:w-32 rounded" />
            <div className="text-center sm:text-left">
              <Skeleton className="h-5 sm:h-7 w-32 sm:w-48 mb-1 sm:mb-2" />
              <Skeleton className="h-3 sm:h-4 w-40 sm:w-64" />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <Skeleton className="h-5 sm:h-7 w-40 sm:w-48 mb-4 sm:mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 sm:h-52 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
