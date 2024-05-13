import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex h-screen items-center justify-center bg-dark-1'>
      <SignIn />
    </div>
  )
}
