import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';
import { Wifi, Zap, Router, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Sign in · Codevertex ISP Billing',
  description: 'Sign in to the Codevertex ISP Billing dashboard.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: brand hero (hidden on small screens) */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden">
        <Image
          src="/images/login/hero-network.jpg"
          alt="Global network connectivity"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* Brand gradient overlay for legibility + identity */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/85 via-purple-700/80 to-gray-900/92" />

        <div className="relative z-10 flex h-full w-full flex-col p-12 text-white">
          <span className="text-2xl font-bold tracking-tight">
            CODEVERTEX
            <span className="ml-2 align-middle text-xs font-medium uppercase tracking-widest text-white/70">
              ISP Billing
            </span>
          </span>

          <div className="mt-auto">
            <h2 className="text-4xl font-bold leading-tight">
              Internet billing,
              <br />
              simplified.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Manage hotspot &amp; PPPoE subscribers, automate M-Pesa billing, and
              control your network — all from one dashboard.
            </p>

            <ul className="mt-8 space-y-3 text-white/90">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Wifi className="h-5 w-5" />
                </span>
                Hotspot &amp; PPPoE subscriber management
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Zap className="h-5 w-5" />
                </span>
                Automated billing &amp; M-Pesa payments
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Router className="h-5 w-5" />
                </span>
                Real-time MikroTik network control
              </li>
            </ul>
          </div>

          <p className="mt-10 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4" />
            Enterprise SSO secured · © Codevertex Africa Limited
          </p>
        </div>
      </div>

      {/* Right: sign-in panel */}
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Image
              src="/images/logo/logo.png"
              alt="Codevertex ISP Billing"
              width={180}
              height={54}
              priority
              className="mx-auto h-14 w-auto"
            />
          </div>
          <LoginForm inline />
        </div>
      </div>
    </div>
  );
}
