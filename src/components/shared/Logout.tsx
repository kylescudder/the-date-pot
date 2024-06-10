'use client'

import { SignOutButton, SignedIn } from '@clerk/nextjs'
import { IconLogout } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

export default function Logout(props: { placement: string }) {
  const router = useRouter()
  return (
    <SignedIn>
      <SignOutButton signOutOptions={{ redirectUrl: 'sign-in' }}>
        <div
          className={`flex cursor-pointer gap-4 ${
            props.placement === 'top' && 'lg:hidden'
          }`}
        >
          <IconLogout
            size={24}
            className='text-zinc-900 dark:text-white'
            stroke={2}
            strokeLinejoin='miter'
          />
          <p className='text-dark-2 dark:text-light-2 font-black max-lg:hidden'>
            Logout
          </p>
        </div>
      </SignOutButton>
    </SignedIn>
  )
}
