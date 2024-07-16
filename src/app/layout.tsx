import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader'
import { Inter as FontSans } from 'next/font/google'

import { cn } from '@/utils'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/common'
import { SessionDataProvider, ThemeProvider } from '@/components/provider'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Sprout & Scribble - Easy Online Shopping',
    default: 'Sprout & Scribble - Easy Online Shopping',
  },
  description:
    'Conveniently shop millions of products and services. Countless benefits including free shipping, discount codes. 111% money back guarantee. Free returns within 30 days. Order now!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionDataProvider>
            <NextTopLoader showSpinner={false} />
            <div className="container sm:px-6 lg:px-8">
              <Header />
              {children}
            </div>
            <Toaster />
          </SessionDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
