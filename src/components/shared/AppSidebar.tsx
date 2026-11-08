import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar'
import NavOptions from './NavOptions'
import { Pot } from '@/server/db/schema'
import { IconHomeHeart } from '@tabler/icons-react'
import { lazy, Suspense } from 'react'

// Loaded lazily, keeping the auth UI out of the main bundle.
const BetterAuthUserMenu = lazy(() =>
  import('@/components/BetterAuthUserMenu').then(({ BetterAuthUserMenu }) => ({
    default: BetterAuthUserMenu
  }))
)

export function AppSidebar(props: { pots: Pot[] }) {
  return (
    <Sidebar variant='inset'>
      <div className='flex items-center justify-between p-4 md:hidden'>
        <div className='flex items-center gap-2'>
          <span className='text-lg font-semibold'>The Date Pot</span>
          <IconHomeHeart className='h-6 w-6' />
        </div>
        <SidebarTrigger />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavOptions position='leftsidebar' pots={props.pots} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-3 p-2'>
            <Suspense
              fallback={
                <span className='block size-8 rounded-full bg-sidebar-accent' />
              }
            >
              <BetterAuthUserMenu />
            </Suspense>
            <span className='text-sm text-sidebar-foreground/80'>Account</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
