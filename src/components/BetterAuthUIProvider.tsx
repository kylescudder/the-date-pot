import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth/auth-provider'
import { passkeyPlugin } from '@/lib/auth/passkey-plugin'
import { emailOtpPlugin } from '@/lib/auth/email-otp-plugin'
import { magicLinkPlugin } from '@/lib/auth/magic-link-plugin'
import { authClient } from '@/lib/auth-client'
import { profileAvatar, profileFields } from '@/lib/profile-ui'
import { appHome, safeAppPath } from '@/lib/auth/safe-path'

// The auth UI keeps one browser-wide query cache, separate from the
// per-member tRPC one, so the sidebar menu and Profile share session state.
// Server renders get a fresh cache each time and never share one.
let browserQueryClient: QueryClient | undefined
export function authQueryClient() {
  if (typeof window === 'undefined') return new QueryClient()
  browserQueryClient ??= new QueryClient()
  return browserQueryClient
}

export function BetterAuthUIProvider({
  children,
  redirectTo = appHome
}: {
  children: ReactNode
  redirectTo?: string
}) {
  const navigate = useNavigate()
  const queryClient = authQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        queryClient={queryClient}
        navigate={({ to, replace }) => {
          void navigate({ href: safeAppPath(to), replace })
        }}
        Link={({ href, ...props }) => (
          <Link to={safeAppPath(href)} {...props} />
        )}
        redirectTo={safeAppPath(redirectTo)}
        basePaths={{ auth: '/auth' }}
        emailAndPassword={{
          enabled: true,
          forgotPassword: true,
          minPasswordLength: 12,
          maxPasswordLength: 128,
          rememberMe: false,
          requireEmailVerification: true
        }}
        additionalFields={profileFields}
        avatar={profileAvatar}
        localization={{ auth: { name: 'Display name' } }}
        plugins={[emailOtpPlugin(), magicLinkPlugin(), passkeyPlugin()]}
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
