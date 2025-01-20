'use client'

import CustomThemeProvider from '@/components/shared/CustomThemeProvider'
import { Pot } from '@/server/db/schema'
import Topbar from './Topbar'
import { SidebarInset } from '../ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

export const MainContent = (props: {
  pots: Pot[]
  children: React.ReactNode
}) => {
  return (
    <CustomThemeProvider>
      <main className='flex w-full flex-row'>
        <section className='flex min-h-screen flex-1 flex-col items-center p-4 lg:p-2'>
          <div className='min-h-full w-full max-w-4xl'>
            <Topbar />
            <SidebarInset>{props.children}</SidebarInset>
          </div>
        </section>
      </main>
      <Toaster />
    </CustomThemeProvider>
  )
}
