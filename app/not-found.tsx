'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="text-7xl font-extrabold text-gray-200">404</div>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">The page you are looking for does not exist or has moved.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Go to Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-pink-600 hover:bg-pink-700">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
