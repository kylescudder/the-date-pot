'use client'

import {
  getAuthCallbackURL,
  authMutationKeys,
  validateEmailAddress
} from '@better-auth-ui/core'

import type { MagicLinkAuthClient } from '@better-auth-ui/core/plugins/magic-link'
import { getSsoFallbackEmail } from '@better-auth-ui/core/plugins/sso'
import { useAuth, useAuthPlugin } from '@better-auth-ui/react'
import { useSignInMagicLink } from '@better-auth-ui/react/plugins/magic-link'
import { useIsMutating } from '@tanstack/react-query'
import { useId } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/auth/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from '@/components/auth/ui/field'
import { Input } from '@/components/auth/ui/input'
import { magicLinkPlugin } from '@/lib/auth/magic-link-plugin'
import { cn } from 'cn'
import { isAuthFormFieldInvalid, useAuthForm } from './auth-form'
import { MAGIC_LINK_SENT_STORAGE_KEY } from './magic-link-sent'
import { ProviderButtons, type SocialLayout } from './provider-buttons'
import { ReauthenticationNotice } from './reauthentication'
import { SignUpPrompt } from './sign-up-prompt'

export type MagicLinkProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: 'top' | 'bottom'
}

/**
 * Render a card-based sign-in form that sends an email magic link and optionally shows social provider buttons.
 *
 * @param className - Additional CSS class names applied to the card container
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The magic-link sign-in UI as a JSX element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = 'bottom'
}: MagicLinkProps) {
  const emailErrorId = useId()
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    navigate,
    plugins,
    redirectTo,
    socialProviders
  } = useAuth<MagicLinkAuthClient>()
  const { localization: magicLinkLocalization, viewPaths: magicLinkViewPaths } =
    useAuthPlugin(magicLinkPlugin)

  const { mutateAsync: signInMagicLink, isPending: signInMagicLinkPending } =
    useSignInMagicLink(authClient, {
      meta: { errorPresentation: 'inline' },
      onSuccess: (_data, variables) => {
        sessionStorage.setItem(MAGIC_LINK_SENT_STORAGE_KEY, variables.email)
        navigate({
          to: `${basePaths.auth}/${magicLinkViewPaths.auth.magicLinkSent}`
        })
      }
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const form = useAuthForm({
    defaultValues: { email: getSsoFallbackEmail() },
    onSubmit: async ({ value }) =>
      await signInMagicLink({
        callbackURL: getAuthCallbackURL(baseURL, redirectTo),
        email: value.email
      })
  })

  const showSeparator = socialProviders && socialProviders.length > 0

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <ReauthenticationNotice />
      <CardHeader>
        <CardTitle className='text-xl'>Sign in with a link</CardTitle>
        <CardDescription>
          Enter your email and we’ll send you a sign-in link. On a phone, open
          it in the same browser you’re using now.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className='flex flex-col gap-6'>
          {socialPosition === 'top' && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view='magicLink' />
              )}

              {showSeparator && (
                <FieldSeparator className='m-0 flex items-center text-xs *:data-[slot=field-separator-content]:bg-card'>
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          <form.AppForm>
            <form.AuthFormRoot
              noValidate
              serverErrorMessage={localization.errors.generic}
            >
              <FieldGroup>
                <form.AppField
                  name='email'
                  validators={{
                    onChange: ({ value }) =>
                      validateEmailAddress(value, {
                        invalidMessage: localization.auth.invalidEmail,
                        requiredMessage: localization.auth.fieldRequired
                      })
                  }}
                >
                  {(field) => {
                    const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor='email'>
                          {localization.auth.email}
                        </FieldLabel>
                        <Input
                          id='email'
                          aria-describedby={
                            isInvalid ? emailErrorId : undefined
                          }
                          name={field.name}
                          type='email'
                          autoComplete='email'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={localization.auth.emailPlaceholder}
                          required
                          disabled={isPending}
                          aria-invalid={isInvalid}
                        />
                        <field.AuthFormFieldError id={emailErrorId} />
                      </Field>
                    )
                  }}
                </form.AppField>

                <div className='flex flex-col gap-3'>
                  <form.AuthFormSubmitButton
                    isPending={signInMagicLinkPending}
                    disabled={isPending}
                  >
                    {magicLinkLocalization.sendMagicLink}
                  </form.AuthFormSubmitButton>

                  {plugins.flatMap((plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => (
                      <AuthButton
                        key={`${plugin.id}-${index.toString()}`}
                        view='magicLink'
                      />
                    ))
                  )}
                </div>
                <form.AuthFormServerError />
              </FieldGroup>
            </form.AuthFormRoot>
          </form.AppForm>

          {socialPosition === 'bottom' && (
            <>
              {showSeparator && (
                <FieldSeparator className='flex items-center text-xs *:data-[slot=field-separator-content]:bg-card'>
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view='magicLink' />
              )}
            </>
          )}
        </div>

        <SignUpPrompt className='mt-4!' />
      </CardContent>
    </Card>
  )
}
