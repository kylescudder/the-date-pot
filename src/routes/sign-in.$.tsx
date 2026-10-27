import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in/$')({
  component: () => (
    <div className='flex h-screen items-center justify-center'>
      <SignIn routing='hash' signUpUrl='/sign-up' forceRedirectUrl='/' />
    </div>
  )
})
