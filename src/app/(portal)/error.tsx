'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('Portal Error:', error.digest || error.message);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Oops! Something went wrong</CardTitle>
          <CardDescription>
            We encountered an error while loading your portal. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error.digest && (
            <p className="text-xs text-muted-foreground text-center">
              Reference: {error.digest}
            </p>
          )}
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
