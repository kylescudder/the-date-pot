// Runs in its own Bun process (see package.json) so DOM globals and auth-client
// modules do not share a module cache with the server tests.
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'
import { Window } from 'happy-dom'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'

const browser = new Window({ url: 'https://datepot.auth.test/profile' })
const originalGlobals = new Map<string, PropertyDescriptor | undefined>()
const originalFetch = globalThis.fetch
let registerOptionsRequests = 0
let signOuts = 0
let root: Root | undefined
let container: HTMLElement
const navigations: string[] = []

const browserEvent = (type: string, cancelable = false) =>
  new browser.Event(type, { bubbles: true, cancelable }) as unknown as Event

let AddPasskeyDialog: typeof import('../src/components/auth/passkey/add-passkey-dialog').AddPasskeyDialog
let AuthProvider: typeof import('../src/components/auth/auth-provider').AuthProvider
let passkeyPlugin: typeof import('../src/lib/auth/passkey-plugin').passkeyPlugin
let authClient: typeof import('../src/lib/auth-client').authClient
let QueryClient: typeof import('@tanstack/react-query').QueryClient

beforeAll(async () => {
  const globals = {
    window: browser,
    document: browser.document,
    navigator: browser.navigator,
    HTMLElement: browser.HTMLElement,
    HTMLInputElement: browser.HTMLInputElement,
    Node: browser.Node,
    Element: browser.Element,
    Event: browser.Event,
    InputEvent: browser.InputEvent,
    // Radix dialogs dispatch these when they open and trap focus.
    CustomEvent: browser.CustomEvent,
    FocusEvent: browser.FocusEvent,
    KeyboardEvent: browser.KeyboardEvent,
    HTMLButtonElement: browser.HTMLButtonElement,
    HTMLDivElement: browser.HTMLDivElement,
    MutationObserver: browser.MutationObserver,
    ResizeObserver: browser.ResizeObserver,
    sessionStorage: browser.sessionStorage,
    getComputedStyle: browser.getComputedStyle.bind(browser),
    requestAnimationFrame: browser.requestAnimationFrame.bind(browser),
    cancelAnimationFrame: browser.cancelAnimationFrame.bind(browser),
    IS_REACT_ACT_ENVIRONMENT: true
  }
  for (const [key, value] of Object.entries(globals)) {
    originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, value })
  }
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
    const url = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
      browser.location.origin
    )
    if (url.pathname === '/api/auth/passkey/generate-register-options') {
      registerOptionsRequests++
      // What production returned: the session is older than freshAge (1 h).
      return Response.json(
        { message: 'Session is not fresh', code: 'SESSION_NOT_FRESH' },
        { status: 403, statusText: 'Forbidden' }
      )
    }
    if (url.pathname === '/api/auth/sign-out') {
      signOuts++
      return Response.json({ success: true })
    }
    if (url.pathname === '/api/auth/get-session') {
      return Response.json({
        user: {
          id: 'first-user',
          name: 'Member',
          email: 'member@example.com',
          emailVerified: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z'
        },
        session: {
          id: 'disposable-session',
          userId: 'first-user',
          expiresAt: '2030-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z'
        }
      })
    }
    if (url.pathname === '/api/auth/passkey/list-user-passkeys')
      return Response.json([])
    throw new Error('Unexpected test request: ' + url.pathname)
  }) as unknown as typeof fetch
  container = document.createElement('div')
  document.body.append(container)
  ;({ AddPasskeyDialog } =
    await import('../src/components/auth/passkey/add-passkey-dialog'))
  ;({ AuthProvider } = await import('../src/components/auth/auth-provider'))
  ;({ passkeyPlugin } = await import('../src/lib/auth/passkey-plugin'))
  ;({ authClient } = await import('../src/lib/auth-client'))
  ;({ QueryClient } = await import('@tanstack/react-query'))
})

afterEach(async () => {
  await act(async () => root?.unmount())
  root = undefined
})

afterAll(async () => {
  // Nanostores delays session-store unmount cleanup by one second.
  await new Promise((resolve) => setTimeout(resolve, 1100))
  globalThis.fetch = originalFetch
  await browser.happyDOM.abort()
  for (const [key, descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
})

test('adding a passkey with a stale session offers "Sign in again" and returns to the profile', async () => {
  const { createRoot } = await import('react-dom/client')
  root = createRoot(container)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  await act(async () => {
    root!.render(
      createElement(
        AuthProvider,
        {
          authClient,
          queryClient,
          navigate: ({ to }) => {
            navigations.push(to)
          },
          basePaths: { auth: '/auth' },
          emailAndPassword: { enabled: false },
          plugins: [passkeyPlugin()]
        },
        createElement(AddPasskeyDialog, { open: true, onOpenChange: () => {} })
      )
    )
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  // The dialog renders in a portal on document.body.
  const dialog = () => document.querySelector('[role="dialog"]')!
  expect(dialog()).toBeTruthy()
  const name = dialog().querySelector<HTMLInputElement>('input[name="name"]')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      browser.HTMLInputElement.prototype,
      'value'
    )!.set!.call(name, '1Password')
    name.dispatchEvent(browserEvent('input'))
  })
  await act(async () => {
    dialog().querySelector('form')!.dispatchEvent(browserEvent('submit', true))
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  expect(registerOptionsRequests).toBe(1)
  // Before the fix the 403 resolved as { error }, so the form stayed put with
  // no message and no way forward.
  expect(dialog().querySelector('input[name="name"]')).toBeNull()
  const signInAgain = Array.from(dialog().querySelectorAll('button')).find(
    (button) => button.textContent?.trim() === 'Sign in again'
  )
  expect(signInAgain).toBeTruthy()
  await act(async () => {
    signInAgain!.click()
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  expect(signOuts).toBe(1)
  expect(navigations).toEqual([
    '/auth/sign-in?reauthenticate=true&redirectTo=%2Fprofile'
  ])
  queryClient.clear()
})
