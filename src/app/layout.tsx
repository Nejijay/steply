import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeColorProvider } from '@/contexts/ThemeColorContext'
import { PWAInstaller } from '@/components/PWAInstaller'

export const metadata: Metadata = {
  title: 'Stephly - Smart Budget Tracker',
  description: 'AI-powered budget tracking made easy with Stephly',
  manifest: '/manifest.json',
  themeColor: '#9333ea',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stephly',
  },
  icons: {
    icon: '/logo/stephly.png',
    apple: '/logo/stephly.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <PWAInstaller />
        <AuthProvider>
          <ThemeProvider>
            <ThemeColorProvider>
              {children}
            </ThemeColorProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
