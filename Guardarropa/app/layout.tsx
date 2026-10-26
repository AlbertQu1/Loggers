import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Inter } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/layout/bottom-nav'
import { HealthIndicator } from '@/components/layout/health-indicator'
import { ToastContainer } from '@/components/common/toast-notifications'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bodoni = Bodoni_Moda({ subsets: ['latin'], variable: '--font-bodoni', weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Stylo',
  description: 'Tu estilista personal: tu clóset, outfits y compras inteligentes',
  applicationName: 'Stylo',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Stylo' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1916' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${bodoni.variable} bg-background`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Stylo" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col">
          <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-serif text-2xl font-medium tracking-tight">
                Stylo<span className="text-accent">.</span>
              </span>
              <HealthIndicator />
            </div>
          </header>
          <main className="flex-1 pb-28">{children}</main>
          <BottomNav />
          <ToastContainer />
        </div>
      </body>
    </html>
  )
}
