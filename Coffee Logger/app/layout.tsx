import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BottomNav } from '@/components/layout/bottom-nav'
import { HealthIndicator } from '@/components/layout/health-indicator'
import { MaintenanceIndicator } from '@/components/layout/maintenance-indicator'
import { PredictionBanner } from '@/components/layout/prediction-banner'
import { ToastContainer } from '@/components/common/toast-notifications'

export const metadata: Metadata = {
  title: 'Coffee Logger',
  description: 'Mobile client for entering coffee events',
  generator: 'v0.app',
  applicationName: 'Coffee Logger',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Coffee Logger',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Coffee Logger" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold">☕ Coffee Logger</h1>
              <div className="flex items-center">
                <MaintenanceIndicator />
                <HealthIndicator />
              </div>
            </div>
          </header>

          <PredictionBanner />

          <main className="flex-1 pb-20">
            {children}
          </main>

          <BottomNav />
          <ToastContainer />
        </div>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
