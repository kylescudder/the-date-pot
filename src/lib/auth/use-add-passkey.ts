'use client'

import {
  addPasskeyOptions,
  type AddPasskeyParams,
  type PasskeyAuthClient
} from '@better-auth-ui/core/plugins/passkey'
import { useSession } from '@better-auth-ui/react'
import { useMutation } from '@tanstack/react-query'

type AddPasskeyResult = Awaited<
  ReturnType<PasskeyAuthClient['passkey']['addPasskey']>
>

type PasskeyRequestErrorBody = {
  code?: string
  message?: string
  status: number
  statusText: string
}

/** Same shape as better-fetch's `BetterFetchError`, so auth UI helpers read it. */
export class PasskeyRequestError extends Error {
  readonly status: number
  readonly statusText: string
  readonly error: PasskeyRequestErrorBody

  constructor(error: PasskeyRequestErrorBody) {
    super(error.message || error.statusText || String(error.status), {
      cause: error
    })
    this.name = 'PasskeyRequestError'
    this.status = error.status
    this.statusText = error.statusText
    this.error = error
  }
}

/**
 * `useAddPasskey` from Better Auth UI, but failures reject the mutation.
 *
 * `@better-auth/passkey`'s `addPasskey` fetches with `throw: false` and ignores
 * `fetchOptions.throw`, so a server refusal (for example `SESSION_NOT_FRESH`
 * from `/passkey/generate-register-options`) resolves as `{ error }`. The stock
 * mutation then "succeeds" and the dialog shows nothing.
 */
export function useAddPasskey(authClient: PasskeyAuthClient) {
  const { data: session } = useSession(authClient)
  const { mutationKey, meta } = addPasskeyOptions(authClient, session?.user.id)

  return useMutation<
    AddPasskeyResult,
    PasskeyRequestError,
    AddPasskeyParams<PasskeyAuthClient>
  >({
    mutationKey,
    meta,
    mutationFn: async (params) => {
      const result = await authClient.passkey.addPasskey(params)
      if (result.error) throw new PasskeyRequestError(result.error)
      return result
    }
  })
}
