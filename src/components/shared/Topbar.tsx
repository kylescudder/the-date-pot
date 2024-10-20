'use client'

import Link from 'next/link'
import { IconHomeHeart } from '@tabler/icons-react'
import CustomThemeProvider from '@/components/shared/CustomThemeProvider'
import { ModeToggle } from '../ui/dark-mode-toggle'
import { Sidebar, SidebarTrigger } from '../ui/sidebar'

export default function Topbar() {
  return (
    <CustomThemeProvider>
      <div className='w-full'>
        <nav className='fixed top-0 z-30 flex w-full items-center justify-between px-6 py-3'>
          <SidebarTrigger className='max-md:hidden' />
          <div className='items-center gap-1'>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </CustomThemeProvider>
  )
}
