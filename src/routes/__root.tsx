import { useEffect, useState, type ReactNode } from 'react'
import {
  ClerkProvider,
  RedirectToSignIn,
  useAuth
} from '@clerk/tanstack-react-start'
import { dark } from '@clerk/themes'
import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation
} from '@tanstack/react-router'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@/server/router'
import { TRPCProvider, setSession, useTRPC } from '@/lib/trpc'
import { ThemeProvider } from '@/components/theme-provider'
import { AppSidebar } from '@/components/shared/AppSidebar'
import { MainContent } from '@/components/shared/MainContent'
import Loading from '@/components/shared/Loading'
import { SidebarProvider } from '@/components/ui/sidebar'
import '@/styles/globals.css'
import '@fontsource-variable/source-code-pro'
import '@fontsource-variable/inter'

const description =
  'A collection of films to watch, places to eat, things to do, coffee shops to rate and vinyls to buy with your loved one. This project is subject to change on a whim if I (and my loved ones) decide we want to change it.'

const icon = (size: number, rel = 'icon') => ({
  rel,
  href: `/assets/maskable_icon_x${size}.png`,
  type: 'image/png',
  sizes: `${size}x${size}`
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#877EFF' },
      { name: 'description', content: description },
      { name: 'application-name', content: 'The Date Pot' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'The Date Pot' },
      { name: 'format-detection', content: 'telephone=no' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'The Date Pot' },
      { property: 'og:title', content: 'The Date Pot' },
      { property: 'og:description', content: description },
      { title: 'The Date Pot' }
    ],
    links: [
      { rel: 'manifest', href: '/manifest.json' },
      ...[48, 72, 96, 128].map((size) => icon(size)),
      ...[192, 384, 512].map((size) => icon(size, 'apple-touch-icon'))
    ]
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className='flex min-h-full flex-col items-center justify-center gap-2 p-6'>
      <p className='text-2xl font-black'>This page could not be found.</p>
      <a className='text-primary underline' href='/'>
        Back to the pot
      </a>
    </div>
  )
})

function RootComponent() {
  useEffect(() => {
    // The app ships no service worker now; remove the old Serwist one so cached
    // pages cannot mask a release.
    if ('serviceWorker' in navigator)
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          registrations.forEach((registration) => registration.unregister())
        )
  }, [])
  return (
    <ClerkProvider
      signInUrl='/sign-in'
      signUpUrl='/sign-up'
      afterSignOutUrl='/sign-in'
      appearance={{ theme: dark }}
    >
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        <App />
      </ThemeProvider>
    </ClerkProvider>
  )
}

function App() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const { isLoaded, isSignedIn, userId } = useAuth()
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))
    return (
      <div className='auth-page'>
        <Outlet />
      </div>
    )
  if (!isLoaded) return <Loading />
  if (!isSignedIn) return <RedirectToSignIn />
  // A fresh provider per identity keeps one person's cached data from another's.
  return <SessionApp key={userId} />
}

function SessionApp() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1 } } })
  )
  const [trpcClient] = useState(() => {
    const client = createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })]
    })
    setSession({ client, queryClient })
    return client
  })
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <Member />
      </TRPCProvider>
    </QueryClientProvider>
  )
}

function Member() {
  const trpc = useTRPC()
  const me = useQuery(trpc.users.me.queryOptions())
  const pots = useQuery(trpc.lookups.pots.queryOptions())
  if (me.isError)
    return (
      <div className='flex h-screen items-center justify-center p-6 text-center'>
        <p className='text-xl font-black'>
          This account isn't part of a date pot yet.
        </p>
      </div>
    )
  if (me.isPending || pots.isPending) return <Loading />
  return (
    <SidebarProvider>
      <AppSidebar pots={pots.data ?? []} />
      <MainContent pots={pots.data ?? []}>
        <Outlet />
      </MainContent>
    </SidebarProvider>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
