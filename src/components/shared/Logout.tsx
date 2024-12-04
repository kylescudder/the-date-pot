'use client'

import { SignOutButton, SignedIn } from '@clerk/nextjs'
import { IconLogout } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

export default function Logout() {
  const router = useRouter()
  return (
    <SignedIn>
      <SignOutButton signOutOptions={{ redirectUrl: 'sign-in' }}>
        <div className='flex w-full cursor-pointer gap-4'>
          <IconLogout size={24} stroke={2} strokeLinejoin='miter' />
          <p>Logout</p>
        </div>
      </SignOutButton>
    </SignedIn>
  )
}
