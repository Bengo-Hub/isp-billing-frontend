'use client';

import { cn } from '@/lib/utils';

// Payment Provider Logo Paths
export const PAYMENT_LOGOS = {
  mpesa: '/logos/payments/mpesa.svg',
  paystack: '/logos/payments/paystack.svg',
  airtel: '/logos/payments/airtel-money.svg',
  visa: '/logos/payments/visa.svg',
  mastercard: '/logos/payments/mastercard.svg',
  verve: '/logos/payments/verve.svg',
  bank: '/logos/payments/bank-transfer.svg',
  ussd: '/logos/payments/ussd.svg',
  qr: '/logos/payments/qr-code.svg',
  applePay: '/logos/payments/apple-pay.svg',
  mtnMomo: '/logos/payments/mtn-momo.svg',
  vodafone: '/logos/payments/vodafone-cash.svg',
  tigo: '/logos/payments/tigo-cash.svg',
} as const;

// Supported payment methods under Paystack
// Organized by category for better UX
export const SUPPORTED_PROVIDERS = [
  // Cards
  { id: 'visa', name: 'Visa', logo: PAYMENT_LOGOS.visa, category: 'card' },
  { id: 'mastercard', name: 'Mastercard', logo: PAYMENT_LOGOS.mastercard, category: 'card' },
  { id: 'verve', name: 'Verve', logo: PAYMENT_LOGOS.verve, category: 'card' },

  // Mobile Money
  { id: 'mpesa', name: 'M-Pesa', logo: PAYMENT_LOGOS.mpesa, category: 'mobile' },
  { id: 'airtel', name: 'Airtel Money', logo: PAYMENT_LOGOS.airtel, category: 'mobile' },
  { id: 'mtnMomo', name: 'MTN MoMo', logo: PAYMENT_LOGOS.mtnMomo, category: 'mobile' },
  { id: 'vodafone', name: 'Vodafone Cash', logo: PAYMENT_LOGOS.vodafone, category: 'mobile' },
  { id: 'tigo', name: 'Tigo Cash', logo: PAYMENT_LOGOS.tigo, category: 'mobile' },

  // Bank & Other
  { id: 'bank', name: 'Bank Transfer', logo: PAYMENT_LOGOS.bank, category: 'bank' },
  { id: 'ussd', name: 'USSD', logo: PAYMENT_LOGOS.ussd, category: 'bank' },
  { id: 'qr', name: 'QR Code', logo: PAYMENT_LOGOS.qr, category: 'other' },
  { id: 'applePay', name: 'Apple Pay', logo: PAYMENT_LOGOS.applePay, category: 'wallet' },
];

interface PaymentMethodSelectorProps {
  disabled?: boolean;
  primaryColor?: string;
}

export function PaymentMethodSelector({
  disabled = false,
  primaryColor = '#ec4899',
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Payment Method</label>

      {/* Paystack Card - Single Payment Option */}
      <div
        className={cn(
          'relative flex flex-col items-center p-5 rounded-xl border-2 transition-all shadow-sm',
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
        )}
        style={{ borderColor: primaryColor }}
      >
        {/* Selected indicator */}
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <img
          src={PAYMENT_LOGOS.paystack}
          alt="Paystack"
          className="h-10 mb-2"
        />
        <span className="text-base font-semibold text-gray-900">Pay with Paystack</span>
        <span className="text-xs text-gray-500 text-center mt-1">Secure payment gateway</span>

        {/* Supported Payment Methods */}
        <div className="mt-4 pt-4 border-t border-gray-100 w-full">
          <p className="text-xs text-gray-400 text-center mb-3">Supported payment methods</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SUPPORTED_PROVIDERS.map((provider) => (
              <img
                key={provider.id}
                src={provider.logo}
                alt={provider.name}
                title={provider.name}
                className="h-6 rounded opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Accepted payment icons row for footer
export function AcceptedPaymentsRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 flex-wrap', className)}>
      <span className="text-xs text-gray-400">We accept:</span>
      <div className="flex items-center gap-2">
        {SUPPORTED_PROVIDERS.map((provider) => (
          <img
            key={provider.id}
            src={provider.logo}
            alt={provider.name}
            title={provider.name}
            className="h-5 opacity-60 hover:opacity-100 transition-opacity"
          />
        ))}
      </div>
    </div>
  );
}
