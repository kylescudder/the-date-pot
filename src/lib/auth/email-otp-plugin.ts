import { createAuthPlugin } from '@better-auth-ui/core'
import {
  emailOtpPlugin as coreEmailOtpPlugin,
  type EmailOtpPluginOptions
} from '@better-auth-ui/core/plugins/email-otp'
import { EmailOtp } from '@/components/auth/email-otp/email-otp'
import { EmailOtpButton } from '@/components/auth/email-otp/email-otp-button'

// Register the sign-in card and its switch button only; email-code password
// reset, verification and email change stay absent (the server refuses them).
export const emailOtpPlugin = createAuthPlugin(
  coreEmailOtpPlugin.id,
  (options: EmailOtpPluginOptions = {}) => ({
    ...coreEmailOtpPlugin(options),
    authButtons: [EmailOtpButton],
    views: { auth: { emailOtp: EmailOtp } },
    fallbackViews: { auth: { signIn: EmailOtp } }
  })
)
