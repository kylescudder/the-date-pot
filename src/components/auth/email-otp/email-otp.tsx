'use client'

import {
  authMutationKeys,
  authQueryKeys,
  validateEmailAddress
} from '@better-auth-ui/core'
import type { EmailOtpAuthClient } from '@better-auth-ui/core/plugins/email-otp'
import { useAuth, useAuthPlugin, useFetchOptions } from '@better-auth-ui/react'
import {
  useSendVerificationOtp,
  useSignInEmailOtp
} from '@better-auth-ui/react/plugins/email-otp'
import { useSelector } from '@tanstack/react-form'
import { useIsMutating, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/auth/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/auth/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/auth/ui/field'
import { Input } from '@/components/auth/ui/input'
import { emailOtpPlugin } from '@/lib/auth/email-otp-plugin'
import {
  clearPendingSignIn,
  emailCodeLifetime,
  readPendingSignIn,
  savePendingSignIn
} from '@/lib/pending-sign-in'
import { cn } from 'cn'
import {
  clearAuthFormServerError,
  isAuthFormFieldInvalid,
  runAuthFormAction,
  setAuthFormServerError,
  useAuthForm
} from '../auth-form'
import { SignUpPrompt } from '../sign-up-prompt'
import { OtpField } from '../otp-field'
import { ReauthenticationNotice } from '../reauthentication'

export type EmailOtpProps = {
  className?: string
  sessionPending?: boolean
}

/**
 * Passwordless sign-in with an emailed one-time code.
 *
 * Two steps on one route: enter an email, then enter the code that arrives.
 * The email step never reveals whether an account exists — the server decides
 * whether the code creates an account, mirroring `emailOTP({ disableSignUp })`.
 *
 * Locally retains the mobile return/reload recovery contract. Only email and
 * request time are persisted; entering all six digits never submits by itself.
 */
export function EmailOtp({ className, sessionPending = false }: EmailOtpProps) {
  const emailErrorId = useId()
  const { authClient, redirectTo, navigate, localization, plugins } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const { fetchOptions, resetCaptcha } = useFetchOptions()
  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent
  const otpClient = authClient as EmailOtpAuthClient
  const queryClient = useQueryClient()
  const requestedAt = useRef(0)
  const sending = useRef(false)
  const [sentAt, setSentAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now)
  const codeSent = sentAt !== null
  const cooldown =
    sentAt === null ? 0 : Math.max(0, Math.ceil((sentAt + 60_000 - now) / 1000))
  const isCoolingDown = cooldown > 0

  const { mutateAsync: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient, {
      onError: () => resetCaptcha(),
      onSuccess: () => {
        resetCaptcha()
        const email = form.state.values.email.trim().toLowerCase()
        form.setFieldValue('email', email)
        form.setFieldValue('code', '')
        savePendingSignIn({ email, sentAt: requestedAt.current })
        setSentAt(requestedAt.current)
        setNow(Date.now())
      }
    })

  const { mutateAsync: signInEmailOtp, isPending: isSigningIn } =
    useSignInEmailOtp(otpClient, {
      onError: () => {
        resetCaptcha()
      },
      onSuccess: async () => {
        clearPendingSignIn()
        await queryClient.invalidateQueries(
          { queryKey: authQueryKeys.session },
          { cancelRefetch: false }
        )
        navigate({ to: redirectTo })
      }
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending =
    sessionPending || signInMutating + signUpMutating > 0 || isSending

  const sendCode = async () => {
    if (
      isPending ||
      sending.current ||
      (sentAt !== null && Date.now() - sentAt < 60_000)
    )
      return
    sending.current = true
    requestedAt.current = Date.now()
    try {
      await sendVerificationOtp({
        email: form.state.values.email.trim().toLowerCase(),
        type: 'sign-in',
        fetchOptions
      })
    } finally {
      sending.current = false
    }
  }

  const form = useAuthForm({
    defaultValues: { code: '', email: '' },
    onSubmit: async ({ value }) => {
      if (isPending || isSigningIn) return
      if (!codeSent) return await sendCode()
      if (Date.now() - sentAt >= emailCodeLifetime) {
        expireCode()
        return
      }
      if (value.code.length !== otpLength) return
      try {
        await signInEmailOtp({
          email: value.email.trim().toLowerCase(),
          otp: value.code,
          fetchOptions
        })
      } catch {
        setAuthFormServerError(
          form,
          'That code could not be verified. Check the code or request a new one.',
          'Unable to sign in. Please try again.'
        )
      }
    }
  })

  function expireCode() {
    clearPendingSignIn()
    setSentAt(null)
    form.setFieldValue('code', '')
    setAuthFormServerError(
      form,
      'That code has expired. Request a new code to continue.',
      'Unable to sign in. Please try again.'
    )
  }

  useEffect(() => {
    const pending = readPendingSignIn()
    if (!pending) return
    form.setFieldValue('email', pending.email)
    setSentAt(pending.sentAt)
    setNow(Date.now())
  }, [form])

  useEffect(() => {
    if (sentAt === null) return
    const updateClock = () => setNow(Date.now())
    const timer = setInterval(updateClock, 1000)
    window.addEventListener('focus', updateClock)
    document.addEventListener('visibilitychange', updateClock)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', updateClock)
      document.removeEventListener('visibilitychange', updateClock)
    }
  }, [sentAt])

  useEffect(() => {
    if (sentAt === null || now - sentAt < emailCodeLifetime) return
    clearPendingSignIn()
    setSentAt(null)
    form.setFieldValue('code', '')
    setAuthFormServerError(
      form,
      'That code has expired. Request a new code to continue.',
      'Unable to sign in. Please try again.'
    )
  }, [form, now, sentAt])

  const codeComplete = useSelector(
    form.store,
    (state) => state.values.code.length === otpLength
  )
  const email = useSelector(form.store, (state) => state.values.email)

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <ReauthenticationNotice />
      <CardHeader>
        <CardTitle className='text-xl'>Sign in with a code</CardTitle>

        <CardDescription>
          {codeSent
            ? `A code is on its way to ${email}. It expires in 10 minutes.`
            : 'Enter your email and we’ll send you a six-digit code.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className='flex flex-col gap-6'>
          {sessionPending && (
            <p role='status' className='text-muted-foreground text-sm'>
              Checking sign-in…
            </p>
          )}
          <form.AppForm>
            <form.AuthFormRoot noValidate>
              <FieldGroup>
                {codeSent ? (
                  <form.AppField name='code'>
                    {(field) => (
                      <OtpField
                        autoFocus
                        disabled={isPending || isSigningIn}
                        label={emailOtpLocalization.code}
                        length={otpLength}
                        name={field.name}
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  </form.AppField>
                ) : (
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
                    {(field) => (
                      <Field
                        data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                      >
                        <FieldLabel htmlFor='email'>
                          {localization.auth.email}
                        </FieldLabel>
                        <Input
                          id='email'
                          aria-describedby={
                            isAuthFormFieldInvalid(field.state.meta)
                              ? emailErrorId
                              : undefined
                          }
                          name={field.name}
                          aria-invalid={isAuthFormFieldInvalid(
                            field.state.meta
                          )}
                          type='email'
                          autoComplete='email webauthn'
                          maxLength={254}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={localization.auth.emailPlaceholder}
                          required
                          disabled={isPending}
                        />
                        <field.AuthFormFieldError id={emailErrorId} />
                      </Field>
                    )}
                  </form.AppField>
                )}

                <form.AuthFormServerError />

                {Captcha && (
                  <div className='flex justify-center'>{Captcha}</div>
                )}

                <div className='flex flex-col gap-3'>
                  <form.AuthFormSubmitButton
                    isPending={isSending || isSigningIn}
                    disabled={
                      isPending || isSigningIn || (codeSent && !codeComplete)
                    }
                  >
                    {codeSent
                      ? emailOtpLocalization.verifyCode
                      : emailOtpLocalization.sendCode}
                  </form.AuthFormSubmitButton>

                  {codeSent ? (
                    <>
                      <Button
                        type='button'
                        variant='outline'
                        disabled={isPending || isSigningIn || isCoolingDown}
                        onClick={() => void runAuthFormAction(form, sendCode)}
                      >
                        {isCoolingDown
                          ? localization.auth.resendIn.replace(
                              '{{seconds}}',
                              String(cooldown)
                            )
                          : localization.auth.resend}
                      </Button>

                      <Button
                        type='button'
                        variant='ghost'
                        disabled={isPending || isSigningIn}
                        onClick={() => {
                          clearPendingSignIn()
                          setSentAt(null)
                          clearAuthFormServerError(form)
                          form.setFieldValue('code', '')
                        }}
                      >
                        {emailOtpLocalization.useDifferentEmail}
                      </Button>
                    </>
                  ) : null}
                  {plugins.flatMap((plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => (
                      <AuthButton
                        key={`${plugin.id}-${index.toString()}`}
                        view='emailOtp'
                      />
                    ))
                  )}
                </div>
              </FieldGroup>
            </form.AuthFormRoot>
          </form.AppForm>
        </div>

        <FieldDescription className='mt-6!'>
          Signed in before? Save a passkey or set a password in Profile for next
          time.
        </FieldDescription>
        <SignUpPrompt className='mt-4!' />
      </CardContent>
    </Card>
  )
}
