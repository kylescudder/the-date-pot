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
        <nav className='sticky top-0 z-30 flex w-full items-center justify-between bg-background p-2 lg:px-6'>
          <div className='gap-1 lg:py-4'>
            <SidebarTrigger />
          </div>
          <div className='items-center gap-1'>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </CustomThemeProvider>
  )
}
