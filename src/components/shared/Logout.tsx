import { SignOutButton, useAuth } from '@clerk/tanstack-react-start'
import { IconLogout } from '@tabler/icons-react'

export default function Logout() {
  const { isSignedIn } = useAuth()
  return isSignedIn ? (
    <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
      <div className='flex w-full cursor-pointer gap-4'>
        <IconLogout size={24} stroke={2} strokeLinejoin='miter' />
        <p>Logout</p>
      </div>
    </SignOutButton>
  ) : null
}
