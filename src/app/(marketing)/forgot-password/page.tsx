'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/features/auth/api';
import { ArrowLeft, Mail, Wifi } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const { mutate: sendResetEmail, isPending } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    sendResetEmail(
      { email },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Wifi className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">Codevertex Africa Limited</span>
          </Link>
          
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-brand-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-600">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isPending}
                      autoFocus
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-600 hover:bg-brand-700"
                    disabled={isPending}
                  >
                    {isPending ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>
                    Remember your password?{' '}
                    <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
                      Sign in
                    </Link>
                  </p>
                </div>
              </Card>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                <p className="text-gray-600">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>

              <Card className="p-8">
                <div className="space-y-4 text-center">
                  <p className="text-gray-700">
                    If you don't see the email in your inbox, please check your spam folder.
                  </p>
                  
                  <div className="pt-4">
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Use a different email
                    </Button>
                  </div>

                  <div className="pt-2">
                    <Link href="/login">
                      <Button variant="ghost" className="w-full">
                        Back to login
                      </Button>
                    </Link>
                  </div>
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

