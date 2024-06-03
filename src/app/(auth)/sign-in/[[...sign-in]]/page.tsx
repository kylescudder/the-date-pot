import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='bg-dark-1 flex h-screen items-center justify-center'>
      <SignIn />
    </div>
  )
}
