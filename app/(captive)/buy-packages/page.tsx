'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Clock, Radio, Wifi, Zap } from 'lucide-react';
import { useState } from 'react';

// Mock packages - in real app, fetch from API
const packages = [
  {
    id: '1',
    name: 'Hourly Access',
    type: 'hotspot',
    duration: '1 Hour',
    speed: '5 Mbps',
    price: 50,
    currency: 'KES',
    icon: Clock,
    popular: false,
  },
  {
    id: '2',
    name: 'Daily Pass',
    type: 'hotspot',
    duration: '24 Hours',
    speed: '10 Mbps',
    price: 200,
    currency: 'KES',
    icon: Zap,
    popular: true,
  },
  {
    id: '3',
    name: 'Weekly Pass',
    type: 'hotspot',
    duration: '7 Days',
    speed: '10 Mbps',
    price: 1000,
    currency: 'KES',
    icon: Radio,
    popular: false,
  },
  {
    id: '4',
    name: 'Monthly Premium',
    type: 'pppoe',
    duration: '30 Days',
    speed: '20 Mbps',
    price: 3500,
    currency: 'KES',
    icon: Wifi,
    popular: false,
  },
];

const paymentMethods = [
  { id: 'mpesa', name: 'M-Pesa', logo: '📱' },
  { id: 'card', name: 'Credit/Debit Card', logo: '💳' },
];

export default function BuyPackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage || !phoneNumber) {
      alert('Please select a package and enter your phone number');
      return;
    }

    setIsProcessing(true);
    
    // TODO: Implement actual payment processing
    setTimeout(() => {
      alert('Payment initiated! Check your phone for M-Pesa prompt.');
      setIsProcessing(false);
    }, 2000);
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Wifi className="h-8 w-8 text-pink-600" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">WiFi Access</h1>
              <p className="text-sm text-gray-600">Select a package to get connected</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Packages Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Package</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;
                
                return (
                  <Card
                    key={pkg.id}
                    className={`p-6 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-2 border-pink-600 shadow-lg'
                        : 'hover:border-pink-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-pink-600 rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-pink-100 mb-3">
                        <Icon className="h-6 w-6 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                        {pkg.type === 'hotspot' ? 'Hotspot' : 'PPPoE'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Zap className="h-4 w-4" />
                        <span>Up to {pkg.speed}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                        <span className="text-gray-600 text-sm">{pkg.currency}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
              
              {selectedPkg ? (
                <div className="space-y-6">
                  {/* Selected Package Summary */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Selected Package</p>
                    <p className="font-bold text-gray-900">{selectedPkg.name}</p>
                    <p className="text-sm text-gray-600">{selectedPkg.duration} • {selectedPkg.speed}</p>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Amount</span>
                          <span className="text-2xl font-bold text-pink-600">
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
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-2xl">{method.logo}</span>
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
                    className="w-full bg-pink-600 hover:bg-pink-700 text-base h-12"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Purchase'}
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
            <a href="mailto:support@codevertex.com" className="text-pink-600 hover:underline">
              support@codevertex.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

