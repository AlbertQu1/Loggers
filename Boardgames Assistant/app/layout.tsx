import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BottomNav } from '@/components/layout/bottom-nav'
import { HealthIndicator } from '@/components/layout/health-indicator'
import { AmigosPendientesBadge } from '@/components/layout/amigos-pendientes-badge'
import { LugaresPendientesBadge } from '@/components/layout/lugares-pendientes-badge'
import { ToastContainer } from '@/components/common/toast-notifications'

export const metadata: Metadata = {
  title: 'Boardgames Assistant',
  description: 'Pregunta las reglas de tus juegos de mesa',
  applicationName: 'Boardgames Assistant',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Boardgames Assistant',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Boardgames Assistant" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold">🎲 Boardgames Assistant</h1>
              <div className="flex items-center gap-3">
                <LugaresPendientesBadge />
                <AmigosPendientesBadge />
                <HealthIndicator />
              </div>
            </div>
          </header>

          <main className="flex-1 pb-20">{children}</main>

          <BottomNav />
          <ToastContainer />
        </div>
      </body>
    </html>
  )
}
