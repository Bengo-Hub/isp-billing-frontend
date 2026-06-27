import { AuthProvider } from '@/components/auth/AuthProvider'
import { OfflineUpdateBar } from '@/components/pwa/OfflineUpdateBar'
import { PwaSplash } from '@/components/pwa/PwaSplash'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { QueryClientProvider } from './providers/query-client-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Codevertex ISP Billing Software',
  description: 'Professional ISP billing and management software',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#9100B0',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Codevertex',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="codevertex-theme">
          <AuthProvider>
            <QueryClientProvider>
              <PwaSplash />
              <OfflineUpdateBar />
              {children}
              <Toaster position="top-right" />
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
