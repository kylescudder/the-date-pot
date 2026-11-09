import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { ChangePassword } from '@/components/auth/settings/security/change-password'
import { UserProfile } from '@/components/auth/settings/account/user-profile'
import { Passkeys } from '@/components/auth/passkey/passkeys'
import {
  BetterAuthUIProvider,
  authQueryClient
} from '@/components/BetterAuthUIProvider'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/profile')({ component: ProfilePage })

function ProfilePage() {
  return (
    <div className='auth-page mx-auto w-full max-w-2xl px-2 pb-12'>
      <h1 className='mt-2 mb-8 text-3xl font-black'>Your profile</h1>
      <BetterAuthUIProvider redirectTo='/profile'>
        <BetterAuthProfile />
      </BetterAuthUIProvider>
    </div>
  )
}

function BetterAuthProfile() {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  // The app shell only renders this page for a signed-in member.
  if (!session) return null
  async function signOut() {
    setSigningOut(true)
    setError('')
    try {
      const result = await authClient.signOut()
      if (result.error) {
        setError('Unable to sign out. Please try again.')
        return
      }
      authQueryClient().clear()
      await navigate({ to: '/' })
    } catch {
      setError('Unable to sign out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }
  return (
    <>
      <UserProfile key={session.user.id} />
      <div className='mt-8'>
        <ChangePassword />
      </div>
      <Passkeys className='mt-8' />
      <p className='text-muted-foreground mt-4 text-sm'>
        Email codes remain available for recovery.
      </p>
      {error && (
        <p role='alert' className='text-destructive mt-6'>
          {error}
        </p>
      )}
      <Button
        type='button'
        variant='outline'
        disabled={signingOut}
        onClick={() => void signOut()}
        className='mt-8'
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </Button>
    </>
  )
}
