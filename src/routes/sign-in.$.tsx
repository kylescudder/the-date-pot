import { createFileRoute, redirect } from '@tanstack/react-router'

// The old sign-in URL keeps working for bookmarks and saved home-screen apps.
export const Route = createFileRoute('/sign-in/$')({
  beforeLoad: () => {
    throw redirect({
      to: '/auth/$path',
      params: { path: 'sign-in' },
      replace: true
    })
  }
})
