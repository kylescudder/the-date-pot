import { createContext, useContext } from 'react'

// Whether new accounts can be created. The server closes sign-up when
// AUTH_ALLOWED_EMAILS is set and sends only this flag, never the list.
// Without a provider it fails closed, so no sign-up link appears.
export const SignUpOpenContext = createContext(false)

export function useSignUpOpen() {
  return useContext(SignUpOpenContext)
}

// The auth page a request for `path` should land on instead, if any.
export function closedSignUpRedirect(path: string, signUpOpen: boolean) {
  return !signUpOpen && path === 'sign-up' ? 'sign-in' : undefined
}
