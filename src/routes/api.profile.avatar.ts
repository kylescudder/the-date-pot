import { createFileRoute } from '@tanstack/react-router'
import { handleProfileRequest } from '@/server/profile'

export const Route = createFileRoute('/api/profile/avatar')({
  server: {
    handlers: {
      GET: ({ request }) => handleProfileRequest(request),
      PUT: ({ request }) => handleProfileRequest(request),
      DELETE: ({ request }) => handleProfileRequest(request)
    }
  }
})
