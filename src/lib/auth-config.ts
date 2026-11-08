import { createServerFn } from '@tanstack/react-start'

// Public auth settings for the client. Credentials and the email allowlist
// stay inside the server function and are never returned.
export const getAuthConfig = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { publicAuthConfig } = await import('../server/env')
    return publicAuthConfig()
  }
)
