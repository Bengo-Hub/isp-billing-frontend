'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo/logo.png"
            alt="CodeVertex Billing"
            width={200}
            height={60}
            className="h-16 w-auto mx-auto"
          />
        </div>

        <LoginForm inline />
      </div>
    </div>
  );
}