'use client'

import { useAuth } from '@better-auth-ui/react'
import { FieldDescription } from '@/components/auth/ui/field'
import { useSignUpOpen } from '@/lib/auth/sign-up'
import { cn } from 'cn'

/** While sign-up is open, every sign-in card links to the sign-up view. */
export function SignUpPrompt({ className }: { className?: string }) {
  const { basePaths, emailAndPassword, localization, viewPaths, Link } =
    useAuth()
  const signUpOpen = useSignUpOpen()
  if (!emailAndPassword?.enabled || !signUpOpen) return null
  return (
    <FieldDescription className={cn('text-center', className)}>
      {localization.auth.needToCreateAnAccount}{' '}
      <Link
        href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
        className='underline underline-offset-4'
      >
        {localization.auth.signUp}
      </Link>
    </FieldDescription>
  )
}
