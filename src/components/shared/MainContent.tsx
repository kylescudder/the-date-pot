'use client'

import CustomThemeProvider from '@/components/shared/CustomThemeProvider'
import { Pot } from '@/server/db/schema'
import Topbar from './Topbar'
import { SidebarInset } from '../ui/sidebar'

export const MainContent = (props: {
  pots: Pot[]
  children: React.ReactNode
}) => {
  return (
    <CustomThemeProvider>
      <main className='flex flex-row'>
        <section className='flex min-h-screen flex-1 flex-col items-center p-4 lg:p-2'>
          <div className='min-h-full w-full max-w-4xl'>
            <Topbar />
            <SidebarInset>{props.children}</SidebarInset>
          </div>
        </section>
      </main>
    </CustomThemeProvider>
  )
}
