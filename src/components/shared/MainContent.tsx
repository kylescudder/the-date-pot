'use client'

import CustomThemeProvider from '@/components/shared/CustomThemeProvider'
import LeftSidebar from './LeftSidebar'
import { Pot } from '@/server/db/schema'

export const MainContent = (props: {
  pots: Pot[]
  children: React.ReactNode
}) => {
  return (
    <CustomThemeProvider>
      <main className='flex flex-row'>
        <LeftSidebar pots={props.pots} />
        <section className='flex min-h-screen flex-1 flex-col items-center bg-light-1 px-6 pb-10 pt-16 dark:bg-dark-1 max-md:pb-32 sm:px-10'>
          <div className='min-h-full w-full max-w-4xl'>{props.children}</div>
        </section>
      </main>
    </CustomThemeProvider>
  )
}
