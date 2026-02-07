'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('Platform Error:', error.digest || error.message);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred in the platform. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error.digest && (
            <p className="text-xs text-muted-foreground text-center">
              Error ID: {error.digest}
            </p>
          )}
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/platform">
              <Home className="w-4 h-4 mr-2" />
              Go to Platform Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
