import { UserRound } from 'lucide-react'
import { UserButton } from '@/components/auth/user/user-button'
import { BetterAuthUIProvider } from '@/components/BetterAuthUIProvider'

// Loaded only for signed-in members, keeping the auth UI out of other pages.
export function BetterAuthUserMenu() {
  return (
    <BetterAuthUIProvider>
      <UserButton
        size='icon'
        align='start'
        side='top'
        hideSettings
        links={[
          {
            label: 'Profile',
            href: '/profile',
            icon: <UserRound />,
            visibility: 'authenticated'
          }
        ]}
      />
    </BetterAuthUIProvider>
  )
}
