import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar'
import NavOptions from './NavOptions'
import { Pot } from '@/server/db/schema'
import Logout from './Logout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { UserButton } from '@clerk/tanstack-react-start'
import { IconCaretUpDown, IconHomeHeart, IconX } from '@tabler/icons-react'
import { useLoaderData } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

// Loaded only under Better Auth, so Clerk mode never downloads the auth UI.
const BetterAuthUserMenu = lazy(() =>
  import('@/components/BetterAuthUserMenu').then(({ BetterAuthUserMenu }) => ({
    default: BetterAuthUserMenu
  }))
)

export function AppSidebar(props: { pots: Pot[] }) {
  const { provider } = useLoaderData({ from: '__root__' })
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
        {provider === 'better-auth' ? (
          <SidebarMenu>
            <SidebarMenuItem className='flex items-center gap-3 p-2'>
              <Suspense
                fallback={
                  <span className='block size-8 rounded-full bg-sidebar-accent' />
                }
              >
                <BetterAuthUserMenu />
              </Suspense>
              <span className='text-sm text-sidebar-foreground/80'>
                Account
              </span>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  >
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground'>
                      <UserButton />
                    </div>
                    <IconCaretUpDown className='ml-auto' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-(--radix-dropdown-menu-trigger-width)'
                  align='start'
                >
                  <DropdownMenuItem>
                    <Logout />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
