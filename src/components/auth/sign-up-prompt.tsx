'use client'

import { useAuth } from '@better-auth-ui/react'
import { FieldDescription } from '@/components/auth/ui/field'
import { cn } from 'cn'

/** The Date Pot has open sign-up: every sign-in card links to the sign-up view. */
export function SignUpPrompt({ className }: { className?: string }) {
  const { basePaths, emailAndPassword, localization, viewPaths, Link } =
    useAuth()
  if (!emailAndPassword?.enabled) return null
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
