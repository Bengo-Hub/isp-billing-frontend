'use client';

export const dynamic = 'force-dynamic';

import { ConnectLoginModal } from '@/components/portal/ConnectLoginModal';
import { AcceptedPaymentsRow, PaymentMethodSelector } from '@/components/portal/PaymentProviders';
import { TermsConditionsModal } from '@/components/portal/TermsConditionsModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAvailablePaymentGateways } from '@/features/payments/api';
import { useHotspotPackages, usePaymentStatus, usePortalConfig, usePurchasePackage, useRedeemVoucher } from '@/features/portal/api';
import { usePortalBranding } from '@/hooks/use-portal-branding';
import { showToast } from '@/lib/utils/toast';
import { AlertCircle, CheckCircle, Clock, Loader2, LogIn, Star, Ticket, Wifi, Zap } from 'lucide-react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CaptiveBuyPackagesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgSlug = params.orgSlug as string;

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'redeem' | 'connect'>('buy');
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const { data: packages, isLoading: packagesLoading } = useHotspotPackages(orgSlug);
  const { data: availableGateways, isLoading: gatewaysLoading } = useAvailablePaymentGateways();
  const { primaryColor } = usePortalBranding(orgSlug);
  const purchaseMutation = usePurchasePackage(orgSlug);
  const redeemMutation = useRedeemVoucher(orgSlug);
  const { data: paymentStatus } = usePaymentStatus(orgSlug, paymentReference || undefined);

  useEffect(() => {
    if (!selectedPaymentMethod) {
      if (availableGateways && availableGateways.length > 0) {
        // Select from available gateways
        const paystackGateway = availableGateways.find(g => g.gateway_type === 'paystack');
        const defaultGateway = paystackGateway || availableGateways.find(g => g.is_primary) || availableGateways[0];
        setSelectedPaymentMethod(defaultGateway.gateway_type);
      } else if (!gatewaysLoading && availableGateways?.length === 0) {
        // Fallback to Paystack if no gateways configured
        setSelectedPaymentMethod('paystack');
      }
    }
  }, [availableGateways, selectedPaymentMethod, gatewaysLoading]);

  const macAddress = searchParams.get('mac') || searchParams.get('mac-address');
  const linkLogin = searchParams.get('link-login');

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `Ksh ${amount}`;
  };

  const formatValidity = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      if (hours === 1) return '1 Hour';
      return `${hours} Hours`;
    }
    if (days === 1) return '1 Day';
    if (days === 7) return '7 Days';
    if (days === 30) return '1 Month';
    return `${days} Days`;
  };

  const formatDataLimit = (dataLimitMB: number) => {
    if (dataLimitMB >= 1000) {
      return `${(dataLimitMB / 1000).toFixed(0)} GB`;
    }
    return `${dataLimitMB} MB`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 0) return 'Unlimited time';
    const hours = Math.floor(seconds / 3600);
    if (hours < 1) return `${Math.floor(seconds / 60)} minutes`;
    return `${hours} hours`;
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    const isPaystack = selectedPaymentMethod === 'paystack';
    const isMpesa = selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till';

    if (isMpesa && !phoneNumber) return;
    try {
      const result = await purchaseMutation.mutateAsync({
        plan_id: selectedPackage,
        phone_number: phoneNumber || undefined,
        email: isPaystack ? 'codevertexitsolutions@gmail.com' : undefined,
        payment_method: selectedPaymentMethod,
      });

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else if (result.reference) {
        setPaymentReference(result.reference);
      }
    } catch {
      showToast.paymentFailed();
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode) return;

    try {
      await redeemMutation.mutateAsync({
        code: voucherCode,
        mac_address: macAddress || undefined,
      });
      showToast.voucherRedeemed();
    } catch {
      showToast.error('Invalid voucher code. Please check and try again.');
    }
  };

  const backgroundColor = '#FFF5F5';

  if (configLoading || packagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  // Payment success
  if (paymentStatus?.is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor }}>
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
          {paymentStatus.username && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Username: {paymentStatus.username}</p>
              <p className="text-sm text-gray-600">Password: {paymentStatus.password}</p>
            </div>
          )}
          {linkLogin && (
            <Button onClick={() => window.location.href = linkLogin} className="w-full" style={{ backgroundColor: primaryColor }}>
              Connect to Internet
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Payment pending
  if (paymentReference && !paymentStatus?.is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor }}>
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
          <p className="text-gray-600 mb-4">Please complete the payment on your phone.</p>
          <Button variant="outline" onClick={() => setPaymentReference(null)}>Cancel</Button>
        </Card>
      </div>
    );
  }

  // Voucher success
  if (redeemMutation.isSuccess && redeemMutation.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor }}>
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-2xl font-bold mb-4">Voucher Redeemed!</h2>
          <p className="text-gray-600 mb-6">{redeemMutation.data.message}</p>
          {linkLogin && (
            <Button onClick={() => window.location.href = linkLogin} className="w-full" style={{ backgroundColor: primaryColor }}>
              Connect to Internet
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Modern Header/Navbar */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Logo - fills available space */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative h-12 sm:h-14 lg:h-16 flex-1 max-w-[280px] sm:max-w-[340px] lg:max-w-[400px]">
                <Image
                  src={config?.logo_url || '/images/logo/logo.png'}
                  alt={config?.organization_name || 'WiFi Portal'}
                  fill
                  className="object-contain object-left"
                  unoptimized={!!config?.logo_url}
                  priority
                />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium whitespace-nowrap hidden xs:inline">
                {config?.organization_name ? `${config.organization_name} WiFi Portal` : 'WiFi Portal'}
              </span>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-3 lg:px-5 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'buy'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'buy' ? { color: primaryColor } : {}}
              >
                <Wifi className="w-4 h-4 inline mr-1 lg:mr-2" />
                <span className="hidden md:inline">Buy Packages</span>
                <span className="md:hidden">Buy</span>
              </button>
              <button
                onClick={() => setActiveTab('redeem')}
                className={`px-3 lg:px-5 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'redeem'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'redeem' ? { color: primaryColor } : {}}
              >
                <Ticket className="w-4 h-4 inline mr-1 lg:mr-2" />
                <span className="hidden md:inline">Redeem</span>
                <span className="md:hidden">Code</span>
              </button>
              <button
                onClick={() => setConnectModalOpen(true)}
                className="px-3 lg:px-5 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap text-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <LogIn className="w-4 h-4 inline mr-1 lg:mr-2" />
                <span className="hidden md:inline">Connect</span>
                <span className="md:hidden">Go</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden mt-2 flex gap-1.5">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'buy'
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700'
              }`}
              style={activeTab === 'buy' ? { backgroundColor: primaryColor } : {}}
            >
              <Wifi className="w-3.5 h-3.5 inline mr-1" />
              Buy
            </button>
            <button
              onClick={() => setActiveTab('redeem')}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'redeem'
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700'
              }`}
              style={activeTab === 'redeem' ? { backgroundColor: primaryColor } : {}}
            >
              <Ticket className="w-3.5 h-3.5 inline mr-1" />
              Redeem
            </button>
            <button
              onClick={() => setConnectModalOpen(true)}
              className="flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <LogIn className="w-3.5 h-3.5 inline mr-1" />
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section - Mobile Optimized */}
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 text-center relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
      }}>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
            {config?.organization_name ? `${config.organization_name} WiFi Portal` : (config?.portal_title || 'WiFi Portal')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/95 font-medium px-2">
            Choose the perfect internet package for your needs
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-x-16 sm:-translate-x-32 -translate-y-16 sm:-translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-white/10 rounded-full translate-x-24 sm:translate-x-48 translate-y-24 sm:translate-y-48 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">

        {activeTab === 'redeem' ? (
          /* Voucher Form - Mobile Optimized */
          <Card className="max-w-md mx-auto p-5 sm:p-6 bg-white">
            <h2 className="text-lg sm:text-xl font-bold text-center mb-5 sm:mb-6">Redeem Voucher</h2>
            <div className="space-y-4">
              <Input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code"
                className="text-center text-base sm:text-lg h-12 sm:h-14"
                autoComplete="off"
              />
              {redeemMutation.isError && (
                <p className="text-red-600 text-xs sm:text-sm text-center">Invalid voucher code</p>
              )}
              <Button
                onClick={handleRedeemVoucher}
                disabled={!voucherCode || redeemMutation.isPending}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold touch-manipulation"
                style={{ backgroundColor: primaryColor }}
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  'Redeem Voucher'
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Packages Grid - Fully Responsive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {packages?.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                return (
                  <Card
                    key={pkg.id}
                    className="relative bg-white overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col"
                    style={{
                      borderColor: isSelected ? primaryColor : '#e5e7eb',
                      borderWidth: '2px',
                    }}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setPaymentModalOpen(true);
                    }}
                  >
                    {/* Popular Badge */}
                    {pkg.is_popular && (
                      <div
                        className="absolute top-0 right-0 text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-bl-xl font-semibold flex items-center gap-1 sm:gap-1.5 shadow-lg z-10"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        <span>Popular</span>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="flex flex-col h-full p-4 sm:p-5 lg:p-6">
                      {/* Header Section */}
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                        )}
                      </div>

                      {/* Price Section */}
                      <div className="mb-4 sm:mb-6">
                        <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: primaryColor }}>
                          {formatCurrency(pkg.price, pkg.currency)}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Valid for {formatValidity(pkg.validity_days)}</span>
                        </div>
                      </div>

                      {/* Features Section - Flexible */}
                      <div className="flex-grow space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                        {/* Speed */}
                        <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-gray-100 shrink-0">
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryColor }} />
                          </div>
                          <span className="font-medium text-gray-700">{pkg.download_speed} Mbps / {pkg.upload_speed} Mbps</span>
                        </div>

                        {/* Data */}
                        <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-gray-100 shrink-0">
                            <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryColor }} />
                          </div>
                          <span className="font-medium text-gray-700">
                            {pkg.is_unlimited_data || pkg.data_limit === -1
                              ? 'Unlimited data'
                              : `${formatDataLimit(pkg.data_limit)} data`}
                          </span>
                        </div>

                        {/* Time limit */}
                        {pkg.time_limit && pkg.time_limit > 0 && (
                          <div className="text-xs sm:text-sm text-gray-600 pl-10 sm:pl-12">
                            {formatTime(pkg.time_limit)}
                          </div>
                        )}
                      </div>

                      {/* Button - Always at Bottom */}
                      <div className="mt-auto">
                        <Button
                          className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition-all touch-manipulation"
                          style={isSelected ? { backgroundColor: primaryColor } : { borderColor: primaryColor, color: primaryColor }}
                          variant={isSelected ? 'default' : 'outline'}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                              Selected
                            </>
                          ) : (
                            'Buy Now'
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Payment Modal - Mobile Optimized */}
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-md p-0 mx-auto">
            <div className="p-4 sm:p-6 w-full overflow-x-hidden">
              <DialogHeader className="mb-4 sm:mb-6">
                <DialogTitle className="text-lg sm:text-xl">Complete Purchase</DialogTitle>
                <DialogDescription className="text-sm sm:text-base break-words">
                  {selectedPackage && packages?.find(p => p.id === selectedPackage)?.name}
                  {' - '}
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(packages?.find(p => p.id === selectedPackage)?.price || 0)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6 w-full">
                {/* Payment Methods */}
                {gatewaysLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : (
                  <PaymentMethodSelector primaryColor={primaryColor} />
                )}

                {/* M-PESA Input */}
                {(selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till') && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">M-PESA Phone Number</Label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XX XXX XXX"
                      type="tel"
                      className="h-11 sm:h-12 text-base"
                      autoComplete="tel"
                    />
                    <p className="text-xs text-gray-500 mt-2">You will receive an STK push on this number</p>
                  </div>
                )}

                {/* Paystack - email handled automatically */}

                {purchaseMutation.isError && (
                  <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg">
                    <p className="text-red-600 text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Payment failed. Please try again.</span>
                    </p>
                  </div>
                )}

                {/* Pay Button - Mobile Optimized */}
                <Button
                  onClick={handlePurchase}
                  disabled={
                    !selectedPaymentMethod ||
                    ((selectedPaymentMethod === 'mpesa_paybill' || selectedPaymentMethod === 'mpesa_till') && !phoneNumber) ||
                    purchaseMutation.isPending
                  }
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold touch-manipulation"
                  style={{ backgroundColor: primaryColor }}
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(packages?.find(p => p.id === selectedPackage)?.price || 0)}`
                  )}
                </Button>

                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  You will receive login credentials after successful payment
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center mt-12 pb-8 space-y-4">
          {/* Accepted Payment Methods */}
          <AcceptedPaymentsRow className="mb-4" />

          <p className="text-sm text-gray-600">
            By purchasing a package or redeeming a voucher, you agree to our{' '}
            <button
              onClick={() => setTermsModalOpen(true)}
              className="underline"
              style={{ color: primaryColor }}
            >
              Terms & Conditions
            </button>
          </p>
          {config?.organization_name && (
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {config.organization_name}. All rights reserved.
            </p>
          )}
          <a className="text-xs text-gray-400 link" href="https://codevertexitsolutions.com" target="_blank" rel="noopener noreferrer">Powered by Codevertex IT Solutions</a>
        </div>
      </div>

      <ConnectLoginModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        orgSlug={orgSlug}
        primaryColor={primaryColor}
        linkLogin={linkLogin}
        macAddress={macAddress}
      />

      <TermsConditionsModal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        orgSlug={orgSlug}
        primaryColor={primaryColor}
      />
    </div>
  );
}
