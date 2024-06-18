'use client'

import Link from 'next/link'
import { IconHomeHeart } from '@tabler/icons-react'
import Logout from './Logout'
import CustomThemeProvider from '@/components/shared/CustomThemeProvider'
import { slide as Menu } from 'react-burger-menu'
import NavOptions from './NavOptions'
import { Pot } from '@/server/db/schema'
import { ModeToggle } from '../ui/dark-mode-toggle'

export default function Topbar(props: { pots: Pot[] }) {
  return (
    <CustomThemeProvider>
      <nav className='topbar'>
        <Link
          href='/'
          className='flex 
			items-center gap-4'
        >
          <IconHomeHeart
            stroke={2}
            strokeLinejoin='miter'
            height={28}
            width={28}
            className='max-sm:hidden'
          />
          <p className='text-2xl font-bold leading-6 max-sm:hidden'>
            The Date Pot
          </p>
        </Link>
        <Menu
          customBurgerIcon={
            <IconHomeHeart
              stroke={2}
              strokeLinejoin='miter'
              height={28}
              width={28}
            />
          }
        >
          <NavOptions position='leftsidebar' pots={props.pots} />
        </Menu>
        <div className='flex items-center gap-1'>
          <ModeToggle />
          <div className='block md:hidden'></div>
        </div>
        <Logout placement='top' />
      </nav>
    </CustomThemeProvider>
  )
}
