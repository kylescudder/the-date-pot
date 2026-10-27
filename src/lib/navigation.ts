import {
  useLocation,
  useRouter as useTanStackRouter
} from '@tanstack/react-router'

// The small part of next/navigation the components use.
export function useRouter() {
  const router = useTanStackRouter()
  return {
    push: (href: string) => router.navigate({ href }),
    back: () => router.history.back(),
    refresh: () => router.invalidate()
  }
}

export function usePathname() {
  return useLocation({ select: (location) => location.pathname })
}
