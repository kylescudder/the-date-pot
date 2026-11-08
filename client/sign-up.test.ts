// Sign-up links follow the server's `signUpOpen` flag: shown while sign-up is
// open, hidden once AUTH_ALLOWED_EMAILS closes it. Rendered on the server, so
// no DOM or auth client is needed.
import { expect, test } from 'bun:test'
import { AuthProvider } from '@better-auth-ui/react'
import { QueryClient } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SignUpPrompt } from '../src/components/auth/sign-up-prompt'
import { MagicLinkSent } from '../src/components/auth/magic-link-sent'
import { magicLinkPlugin } from '../src/lib/auth/magic-link-plugin'
import {
  SignUpOpenContext,
  closedSignUpRedirect
} from '../src/lib/auth/sign-up'

function render(element: ReactNode, signUpOpen?: boolean) {
  const view = createElement(
    AuthProvider,
    {
      // These views never call the client while rendering.
      authClient: {} as never,
      queryClient: new QueryClient(),
      navigate: () => {},
      Link: ({ href, children, className }) =>
        createElement('a', { href, className }, children),
      basePaths: { auth: '/auth' },
      emailAndPassword: { enabled: true },
      plugins: [magicLinkPlugin()]
    },
    element
  )
  return renderToStaticMarkup(
    signUpOpen === undefined
      ? view
      : createElement(SignUpOpenContext, { value: signUpOpen }, view)
  )
}

const signUpLink = 'href="/auth/sign-up"'

test('open sign-up: sign-in and "check your email" link to sign-up', () => {
  for (const view of [
    createElement(SignUpPrompt),
    createElement(MagicLinkSent)
  ]) {
    const html = render(view, true)
    expect(html).toContain(signUpLink)
    expect(html).toContain('Sign Up')
  }
  expect(closedSignUpRedirect('sign-up', true)).toBeUndefined()
  expect(closedSignUpRedirect('sign-in', true)).toBeUndefined()
})

test('closed sign-up: no sign-up links, and /auth/sign-up goes to sign-in', () => {
  for (const view of [
    createElement(SignUpPrompt),
    createElement(MagicLinkSent)
  ]) {
    const html = render(view, false)
    expect(html).not.toContain(signUpLink)
    expect(html).not.toContain('Sign Up')
  }
  // The magic-link confirmation itself still renders.
  expect(render(createElement(MagicLinkSent), false)).toContain('email')
  expect(closedSignUpRedirect('sign-up', false)).toBe('sign-in')
  expect(closedSignUpRedirect('sign-in', false)).toBeUndefined()
  expect(closedSignUpRedirect('magic-link', false)).toBeUndefined()
})

test('without the server flag, sign-up links stay hidden', () => {
  expect(render(createElement(SignUpPrompt))).not.toContain(signUpLink)
})
