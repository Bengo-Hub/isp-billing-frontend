import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export default function CaptiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {children}
      <Toaster position="top-center" richColors />
    </div>
  );
}
