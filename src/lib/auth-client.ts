import { createAuthClient } from 'better-auth/react'
import {
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient
} from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    magicLinkClient(),
    passkeyClient(),
    inferAdditionalFields({
      user: {
        givenName: { type: 'string', required: false, defaultValue: '' },
        familyName: { type: 'string', required: false, defaultValue: '' }
      }
    })
  ]
})
