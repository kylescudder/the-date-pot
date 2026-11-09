import { createFileRoute, redirect } from '@tanstack/react-router'
import { IconHomeHeart } from '@tabler/icons-react'
import { Auth } from '@/components/auth/auth'
import { BetterAuthUIProvider } from '@/components/BetterAuthUIProvider'
import { Toaster } from '@/components/ui/sonner'
import { getAuthConfig } from '@/lib/auth-config'
import { closedSignUpRedirect } from '@/lib/auth/sign-up'

export const Route = createFileRoute('/auth/$path')({
  // Better Auth UI reads `redirectTo` itself and passes it through safeAppPath.
  validateSearch: (search: Record<string, unknown>): { redirectTo?: string } =>
    typeof search.redirectTo === 'string'
      ? { redirectTo: search.redirectTo }
      : {},
  // With sign-up closed (AUTH_ALLOWED_EMAILS set), the sign-up page is
  // sign-in instead. Other auth pages skip the extra settings request.
  beforeLoad: async ({ params, search }) => {
    if (params.path !== 'sign-up') return
    const { signUpOpen } = await getAuthConfig()
    const path = closedSignUpRedirect(params.path, signUpOpen)
    if (path)
      throw redirect({
        to: '/auth/$path',
        params: { path },
        search,
        replace: true
      })
  },
  component: AuthPage
})

function AuthPage() {
  const { path } = Route.useParams()
  return (
    <div className='bg-background text-foreground min-h-dvh px-4 py-8 sm:px-8'>
      <header className='mx-auto flex max-w-sm items-center justify-center'>
        <a
          href='/'
          className='flex items-center gap-2 text-xl font-semibold tracking-tight'
        >
          <IconHomeHeart aria-hidden='true' className='text-primary size-7' />
          The Date Pot
        </a>
      </header>
      <main className='mx-auto mt-8 flex w-full max-w-sm flex-col items-center gap-6 sm:mt-14'>
        <BetterAuthUIProvider>
          <Auth path={path} className='w-full text-left' />
        </BetterAuthUIProvider>
        <p className='text-muted-foreground text-center text-sm'>
          Films, food, coffee, vinyls and days out, planned together.
        </p>
      </main>
      <Toaster />
    </div>
  )
}
