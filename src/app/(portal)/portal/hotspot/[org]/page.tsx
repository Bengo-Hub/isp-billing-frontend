'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaymentMethodSelector } from '@/components/portal/PaymentProviders';
import { TermsConditionsModal } from '@/components/portal/TermsConditionsModal';
import { useHotspotPackages, usePaymentStatus, usePortalConfig, usePurchasePackage } from '@/features/portal/api';
import { AlertCircle, CheckCircle, Clock, Loader2, Star, Wifi, Zap, Phone, Calendar, LogOut, CreditCard } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PackagePhoneNumbers {
  [key: number]: string;
}

export default function HotspotCustomerPortal() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.org as string;

  const [packagePhoneNumbers, setPackagePhoneNumbers] = useState<PackagePhoneNumbers>({});
  const [packageEmails, setPackageEmails] = useState<{ [key: number]: string }>({});
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState<number | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedPaymentMethod] = useState('paystack'); // Default to Paystack
  const [currentSession, setCurrentSession] = useState<any | null>(null);

  const { data: config, isLoading: configLoading } = usePortalConfig(orgSlug);
  const { data: packages, isLoading: packagesLoading } = useHotspotPackages(orgSlug);
  const purchaseMutation = usePurchasePackage(orgSlug);
  const { data: paymentStatus } = usePaymentStatus(orgSlug, paymentReference || undefined);

  // Mock usage data - replace with real API data
  const monthlyUsageData = [
    { month: 'Jan', download: 0.5, upload: 0.3 },
    { month: 'Feb', download: 0.7, upload: 0.4 },
    { month: 'Mar', download: 0.6, upload: 0.35 },
    { month: 'Apr', download: 0.8, upload: 0.45 },
    { month: 'May', download: 0.9, upload: 0.5 },
    { month: 'Jun', download: 0.75, upload: 0.42 },
    { month: 'Jul', download: 0.85, upload: 0.48 },
  ];

  // Load current session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem(`hotspot_session_${orgSlug}`);
    if (savedSession) {
      try {
        setCurrentSession(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem(`hotspot_session_${orgSlug}`);
      }
    }
  }, [orgSlug]);

  // Save successful payment to session
  useEffect(() => {
    if (paymentStatus?.is_completed && paymentStatus?.voucher_code) {
      const session = {
        voucher_code: paymentStatus.voucher_code,
        username: paymentStatus.username,
        package_name: packages?.find(p => p.id === purchasingPackageId)?.name || 'Package',
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mock expiry
      };
      localStorage.setItem(`hotspot_session_${orgSlug}`, JSON.stringify(session));
      setCurrentSession(session);
      setPaymentReference(null);
      setPurchasingPackageId(null);
      setPaymentModalOpen(false);
    }
  }, [paymentStatus, orgSlug, packages, purchasingPackageId]);

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatValidity = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      if (hours === 1) return '1 Hour';
      return `${hours} Hours`;
    }
    if (days === 1) return '1 Day';
    if (days === 7) return '1 Week';
    if (days === 30) return '1 Month';
    return `${days} Days`;
  };

  const handleSubscribeClick = (packageId: number) => {
    setSelectedPackageId(packageId);
    setPaymentModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedPackageId) return;

    const isPaystack = selectedPaymentMethod === 'paystack';
    const phoneNumber = packagePhoneNumbers[selectedPackageId];

    setPurchasingPackageId(selectedPackageId);

    try {
      const result = await purchaseMutation.mutateAsync({
        plan_id: selectedPackageId,
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
      setPurchasingPackageId(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(`hotspot_session_${orgSlug}`);
    setCurrentSession(null);
    router.push('/');
  };

  const primaryColor = config?.primary_color || '#ec4899';
  const supportPhone = '+254 722 434795';
  const userName = currentSession?.username || 'Guest';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  if (configLoading || packagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  // Payment pending screen
  if (paymentReference && !paymentStatus?.is_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
          <p className="text-gray-600 mb-4">Please complete the payment.</p>
          <Button variant="outline" onClick={() => setPaymentReference(null)}>Cancel</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <Wifi className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {userName}
            </h1>
            <p className="text-sm text-gray-500">{config?.organization_name || 'Customer Portal'}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>

      {/* Current Package & Customer Care */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Package */}
        {currentSession && (
          <Card className="p-6 border-2" style={{ borderColor: primaryColor }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current Package</p>
                <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                  {currentSession.package_name}
                </h2>
              </div>
              <Button size="sm" style={{ backgroundColor: primaryColor }}>
                Renew
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Your plan will expire on</span>
              </div>
              <p className="text-lg font-semibold">
                {new Date(currentSession.expiry_date).toLocaleString()}
              </p>
            </div>
          </Card>
        )}

        {/* Customer Care */}
        <Card className="p-6 border-2" style={{ borderColor: `${primaryColor}40` }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
              <Phone className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer care:</p>
              <a
                href={`tel:${supportPhone}`}
                className="text-lg font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                {supportPhone}
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Internet Usage */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Internet usage (GB)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="download" stroke="#ef4444" name="Download" />
              <Line type="monotone" dataKey="upload" stroke="#3b82f6" name="Upload" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Internet Usage (Current Period) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Internet usage (GB)</h3>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Wifi className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No usage data available</p>
              <p className="text-sm text-gray-400">Usage tracking coming soon</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Packages Section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6">Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages?.map((pkg) => (
            <Card
              key={pkg.id}
              className="relative overflow-hidden hover:shadow-lg transition-all p-6"
            >
              {pkg.is_popular && (
                <div
                  className="absolute top-0 right-0 text-white text-xs px-3 py-1 rounded-bl-lg flex items-center gap-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Star className="w-3 h-3 fill-current" />
                  Popular
                </div>
              )}

              <h4 className="text-lg font-bold mb-1">{pkg.name}</h4>
              <div className="text-2xl font-bold mb-3" style={{ color: primaryColor }}>
                @ {formatCurrency(pkg.price, pkg.currency)}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700 mb-4 w-fit">
                <Clock className="w-4 h-4" />
                <span>Valid for {formatValidity(pkg.validity_days)}</span>
              </div>

              {pkg.description && (
                <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
              )}

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-4 h-4" />
                  <span>Speed: {pkg.download_speed} Mbps</span>
                </div>
                {pkg.is_unlimited_data || pkg.data_limit === -1 ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wifi className="w-4 h-4" />
                    <span>Unlimited Data</span>
                  </div>
                ) : pkg.data_limit > 0 ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wifi className="w-4 h-4" />
                    <span>{pkg.data_limit} MB Data</span>
                  </div>
                ) : null}
              </div>

              {pkg.features && pkg.features.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={() => handleSubscribeClick(pkg.id)}
                className="w-full mt-2"
                style={{ backgroundColor: primaryColor }}
              >
                Subscribe Now
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Previous Payments Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Previous Payments</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Per page</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>

        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No payments</p>
          <p className="text-sm text-gray-400 mt-1">Your payment history will appear here</p>
        </div>
      </Card>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              {selectedPackageId && packages?.find(p => p.id === selectedPackageId)?.name}
              {' - '}
              <span className="font-bold" style={{ color: primaryColor }}>
                {formatCurrency(packages?.find(p => p.id === selectedPackageId)?.price || 0)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Method Selector */}
            <PaymentMethodSelector primaryColor={primaryColor} />

            {/* Paystack - email handled automatically */}

            {purchaseMutation.isError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Payment failed. Please try again.
                </p>
              </div>
            )}

            {/* Pay Button */}
            <Button
              onClick={handlePurchase}
              disabled={
                !selectedPaymentMethod ||
                purchaseMutation.isPending
              }
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              {purchaseMutation.isPending
                ? 'Processing...'
                : `Pay ${formatCurrency(packages?.find(p => p.id === selectedPackageId)?.price || 0)}`}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You will receive login credentials after successful payment
            </p>
          </div>
        </DialogContent>
      </Dialog>

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
