import React from 'react'
import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { dark } from '@clerk/themes'
import '@/styles/globals.css'
import Topbar from '@/components/shared/Topbar'
import { MainContent } from '@/components/shared/MainContent'
import { getUserInfo } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import { Toast } from '@/components/shared/Toast'
import { getPots } from '@/lib/actions/pot.actions'
import '@fontsource/ubuntu'
import { Pot, User } from '@/server/db/schema'
import { ThemeProvider } from '@/components/theme-provider'
import { AppSidebar } from '@/components/shared/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

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
      default: 'The Date Poto',
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

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user) return null

  const userInfo: User | undefined = await getUserInfo(user.id)
  if (!userInfo?.onboarded) redirect('/onboarding')

  const pots: Pot[] = await getPots()
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}
    >
      <html lang='en'>
        <body>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar pots={pots} />
              <MainContent pots={pots} children={children} />
              <Toast />
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
