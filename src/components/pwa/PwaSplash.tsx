'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Branded splash overlay shown briefly when the app is launched as an installed
 * PWA (standalone display-mode) — gives the native-app launch feel without
 * needing dozens of per-device iOS startup images. No-op in a normal browser
 * tab and only shows once per launch (sessionStorage).
 */
export function PwaSplash() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;
    try {
      if (sessionStorage.getItem('cv_splash_shown')) return;
      sessionStorage.setItem('cv_splash_shown', '1');
    } catch {
      /* sessionStorage unavailable — still show once */
    }
    setShow(true);
    const fadeTimer = setTimeout(() => setFading(true), 900);
    const hideTimer = setTimeout(() => setShow(false), 1300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#9100B0' }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="rounded-2xl bg-white/95 p-5 shadow-xl">
          <Image
            src="/images/logo/logo.png"
            alt="Codevertex"
            width={120}
            height={120}
            priority
            className="h-auto w-[120px] object-contain"
          />
        </div>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/30">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
