import {
  createFileRoute,
  Navigate,
  useLoaderData
} from '@tanstack/react-router'
import { IconHomeHeart } from '@tabler/icons-react'
import { Auth } from '@/components/auth/auth'
import { BetterAuthUIProvider } from '@/components/BetterAuthUIProvider'
import { Toaster } from '@/components/ui/sonner'

export const Route = createFileRoute('/auth/$path')({ component: AuthPage })

function AuthPage() {
  const { provider } = useLoaderData({ from: '__root__' })
  const { path } = Route.useParams()
  // Clerk keeps its own /sign-in and /sign-up pages; these are Better Auth only.
  if (provider !== 'better-auth') return <Navigate href='/sign-in' replace />
  return (
    <div className='min-h-dvh bg-background px-4 py-8 text-foreground sm:px-8'>
      <header className='mx-auto flex max-w-sm items-center justify-center'>
        <a
          href='/'
          className='flex items-center gap-2 text-xl font-semibold tracking-tight'
        >
          <IconHomeHeart aria-hidden='true' className='size-7 text-primary' />
          The Date Pot
        </a>
      </header>
      <main className='mx-auto mt-8 flex w-full max-w-sm flex-col items-center gap-6 sm:mt-14'>
        {/* Sign-up is open: anyone can create an account and start a pot. */}
        <BetterAuthUIProvider>
          <Auth path={path} className='w-full text-left' />
        </BetterAuthUIProvider>
        <p className='text-center text-sm text-muted-foreground'>
          Films, food, coffee, vinyls and days out, planned together.
        </p>
      </main>
      <Toaster />
    </div>
  )
}
