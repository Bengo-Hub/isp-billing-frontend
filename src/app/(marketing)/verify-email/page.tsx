'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVerifyUser, useResendVerification } from '@/features/auth/api';
import { CheckCircle, Mail, Wifi, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { mutate: verifyUser, isPending } = useVerifyUser();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  useEffect(() => {
    if (token) {
      // Automatically verify when token is present
      verifyUser(
        { token, verification_type: 'email' },
        {
          onSuccess: () => {
            setVerificationStatus('success');
          },
          onError: () => {
            setVerificationStatus('error');
          },
        }
      );
    }
  }, [token, verifyUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Wifi className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">Codevertex IT Solutions</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          {/* Pending State */}
          {verificationStatus === 'pending' && isPending && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifying Your Email</h1>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>

              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
              </Card>
            </>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                <p className="text-gray-600">
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
              </div>

              <Card className="p-8">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-center">
                      ✓ Your account is now active and ready to use
                    </p>
                  </div>

                  <Link href="/login">
                    <Button className="w-full bg-brand-600 hover:bg-brand-700">
                      Continue to Login
                    </Button>
                  </Link>
                </div>
              </Card>
            </>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                <p className="text-gray-600">
                  The verification link is invalid or has expired.
                </p>
              </div>

              <Card className="p-8">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-center text-sm">
                      This verification link may have expired or already been used.
                    </p>
                  </div>

                  <Button
                    onClick={() => resendVerification()}
                    disabled={isResending}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>

                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </Card>
            </>
          )}

          {/* No Token State */}
          {!token && verificationStatus === 'pending' && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-yellow-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                <p className="text-gray-600">
                  We've sent a verification link to your email address.
                </p>
              </div>

              <Card className="p-8">
                <div className="space-y-4 text-center">
                  <p className="text-gray-700">
                    Click the link in the email to verify your account. If you don't see the email, check your spam folder.
                  </p>

                  <Button
                    onClick={() => resendVerification()}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>

                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </Card>
            </>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need help?{' '}
              <Link href="/contact" className="text-brand-600 hover:text-brand-700">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

