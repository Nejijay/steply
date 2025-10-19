import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeColorProvider } from '@/contexts/ThemeColorContext'

export const metadata: Metadata = {
  title: 'Stephly - Smart Budget Tracker',
  description: 'Track your steps and finances with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
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
