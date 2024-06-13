// app/layout.tsx
import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { dark } from '@clerk/themes'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#877EFF'
}

export const metadata: Metadata = {
  title: 'The Date Pot',
  description:
    'A collection of films to watch, places to eat, things to do, coffee shops to rate and vinyls to buy with your loved one. This project is subject to change on a whim if I (and my loved ones) decide we want to change it.',
  applicationName: 'The Date Pot',
  manifest: '/manifest.json',
  icons: [
    {
      url: '/assets/maskable_icon_x48.png',
      type: 'image/png',
      sizes: '48x48'
    },
    {
      url: '/assets/maskable_icon_x72.png',
      type: 'image/png',
      sizes: '72x72'
    },
    {
      url: '/assets/maskable_icon_x96.png',
      type: 'image/png',
      sizes: '96x96'
    },
    {
      url: '/assets/maskable_icon_x128.png',
      type: 'image/png',
      sizes: '128x128'
    },
    {
      url: '/assets/maskable_icon_x192.png',
      type: 'image/png',
      sizes: '192x192',
      rel: 'apple-touch-icon'
    },
    {
      url: '/assets/maskable_icon_x384.png',
      type: 'image/png',
      sizes: '384x384',
      rel: 'apple-touch-icon'
    },
    {
      url: '/assets/maskable_icon_x512.png',
      type: 'image/png',
      sizes: '512x512',
      rel: 'apple-touch-icon'
    }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Date Pot'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'The Date Pot',
    title: {
      default: 'The Date Pot',
      template: '% - PWA App'
    },
    description:
      'A collection of films to watch, places to eat, things to do, coffee shops to rate and vinyls to buy with your loved one. This project is subject to change on a whim if I (and my loved ones) decide we want to change it.'
  },
  twitter: {
    card: 'summary',
    title: {
      default: 'The Date Pot',
      template: '% - PWA App'
    },
    description:
      'A collection of films to watch, places to eat, things to do, coffee shops to rate and vinyls to buy with your loved one. This project is subject to change on a whim if I (and my loved ones) decide we want to change it.'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}
    >
      <html lang='en'>
        <body className={`${inter.className}`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
