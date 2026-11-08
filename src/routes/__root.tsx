import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query'
import {
  HeadContent,
  Navigate,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
  useLocation
} from '@tanstack/react-router'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@/server/router'
import { TRPCProvider, setSession, useTRPC } from '@/lib/trpc'
import { getAuthConfig } from '@/lib/auth-config'
import { authClient } from '@/lib/auth-client'
import { clearPendingSignIn } from '@/lib/pending-sign-in'
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
  // Public auth settings (whether sign-up is open), read at runtime.
  loader: () => getAuthConfig(),
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
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <AuthenticatedApp />
    </ThemeProvider>
  )
}

const AuthPage = ({ children }: { children: ReactNode }) => (
  <div className='auth-page'>{children}</div>
)

function AuthenticatedApp() {
  const location = useLocation()
  const { data: session, isPending, refetch } = authClient.useSession()
  const { pathname } = location
  // Decide from the route the Outlet will actually render, not the new
  // location: during a navigation the Outlet still shows the previous match,
  // which must never render outside its providers.
  const leafRoute = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId
  })
  const isAuthRoute = leafRoute === '/auth/$path'
  // Sign-in navigates here before the shared session store has refreshed, so
  // confirm a signed-out state with the server once per page before
  // redirecting to sign-in.
  const [confirmedSignedOut, setConfirmedSignedOut] = useState<string | null>(
    null
  )
  const needsCheck =
    !isPending &&
    !session &&
    !isAuthRoute &&
    !pathname.startsWith('/auth/') &&
    confirmedSignedOut !== pathname
  useEffect(() => {
    if (session) clearPendingSignIn()
  }, [session])
  // `refetch` changes identity on every render, so keep it out of the effect's
  // dependencies and run at most one check per path.
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch
  const checking = useRef<string | null>(null)
  useEffect(() => {
    if (!needsCheck || checking.current === pathname) return
    checking.current = pathname
    void refetchRef.current().finally(() => {
      checking.current = null
      setConfirmedSignedOut(pathname)
    })
  }, [needsCheck, pathname])
  if (isAuthRoute)
    return (
      <AuthPage>
        <Outlet />
      </AuthPage>
    )
  // Navigating to an auth page: the Outlet still holds the previous route
  // (which may need providers that are gone), and re-rendering <Navigate>
  // would navigate again on every render.
  if (pathname.startsWith('/auth/')) return <Loading />
  if (isPending || needsCheck) return <Loading />
  if (!session)
    return (
      <Navigate
        to='/auth/$path'
        params={{ path: 'sign-in' }}
        // `href` is the in-app path, search and hash; safeAppPath re-checks it.
        search={{ redirectTo: location.href }}
        replace
      />
    )
  // A fresh provider per identity keeps one person's cached data from another's.
  return <SessionApp key={session.user.id} />
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
