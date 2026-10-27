import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up/$')({
  component: () => (
    <div className='flex h-screen items-center justify-center'>
      <SignUp routing='hash' signInUrl='/sign-in' forceRedirectUrl='/' />
    </div>
  )
})
