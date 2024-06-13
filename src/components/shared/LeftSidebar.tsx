'use client'

import NavOptions from './NavOptions'
import Logout from './Logout'
import { Pot } from '@/server/db/schema'

export default function LeftSidebar(props: { pots: Pot[] }) {
  return (
    <section
      className='custom-scrollbar border-r-light-4 dark:border-r-dark-4 sticky left-0 
      top-0 z-20 flex h-screen w-fit 
      flex-col justify-between overflow-auto border-r 
      pb-5 pt-28 text-zinc-400 dark:bg-zinc-900 max-md:hidden'
    >
      <div
        className='flex
    	w-full flex-1
    	flex-col gap-6 px-6'
      >
        <NavOptions position='leftsidebar' pots={props.pots} />
      </div>
      <div className='mt-10 px-6'>
        <Logout placement='' />
      </div>
    </section>
  )
}
