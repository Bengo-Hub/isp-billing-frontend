'use client';

import { Card } from '@/components/ui/card';
import type { ProviderContact } from '@/features/portal/api';
import { Mail, MapPin, MessageCircle, Phone, WifiOff } from 'lucide-react';

interface ServiceUnavailableCardProps {
  /** Provider contact details (name/phone/email/whatsapp/address/city). */
  contact?: ProviderContact | null;
  /** Brand color for accents. */
  primaryColor?: string;
  /** Optional organization name fallback when contact.name is absent. */
  organizationName?: string;
}

/**
 * Customer-facing "Service temporarily unavailable" card.
 *
 * Shown on the captive/portal buy pages when the PROVIDER's subscription has
 * lapsed (config.provider_active === false, or a purchase 403 with
 * code='provider_subscription_inactive').
 *
 * IMPORTANT copy rule: this is shown to END CUSTOMERS. Never use billing words
 * like "suspended/expired/subscription". Frame it as a temporary outage and
 * point them to the provider to restore service.
 */
export function ServiceUnavailableCard({
  contact,
  primaryColor = '#9100B0',
  organizationName,
}: ServiceUnavailableCardProps) {
  const providerName = contact?.name || organizationName || 'your provider';
  const whatsappDigits = (contact?.whatsapp || '').replace(/[^\d]/g, '');
  const location = [contact?.address, contact?.city].filter(Boolean).join(', ');

  const hasAnyContact =
    !!contact?.phone || !!contact?.email || !!whatsappDigits || !!location;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF6FC' }}>
      <Card className="max-w-md w-full p-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <WifiOff className="w-8 h-8" style={{ color: primaryColor }} />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-900">Service temporarily unavailable</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          This hotspot is temporarily unavailable. Please contact{' '}
          <span className="font-semibold text-gray-800">{providerName}</span> to restore service.
        </p>

        {hasAnyContact && (
          <div className="space-y-3 text-left">
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Call us</p>
                  <p className="font-medium text-gray-900 truncate">{contact.phone}</p>
                </div>
              </a>
            )}

            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                  <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">WhatsApp</p>
                  <p className="font-medium text-gray-900 truncate">{contact?.whatsapp}</p>
                </div>
              </a>
            )}

            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 truncate">{contact.email}</p>
                </div>
              </a>
            )}

            {location && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                  <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Visit us</p>
                  <p className="font-medium text-gray-900">{location}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">
          We apologize for the inconvenience. Service will be back shortly.
        </p>
      </Card>
    </div>
  );
}

export default ServiceUnavailableCard;
