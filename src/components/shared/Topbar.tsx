'use client'

import Link from 'next/link'
import { IconHomeHeart } from '@tabler/icons-react'
import Logout from './Logout'
import CustomThemeProvider from '@/components/shared/CustomThemeProvider'
import { DarkModeToggle } from '../ui/dark-mode-toggle'
import { slide as Menu } from 'react-burger-menu'
import NavOptions from './NavOptions'
import { IPot } from '@/lib/models/pot'

export default function Topbar(props: { pots: IPot[] }) {
  return (
    <CustomThemeProvider>
      <nav className="topbar">
        <Link
          href="/"
          className="flex 
			items-center gap-4"
        >
          <IconHomeHeart
            stroke={2}
            strokeLinejoin="miter"
            height={28}
            width={28}
            className="text-dark-1 dark:text-light-1 max-sm:hidden"
          />
          <p
            className="text-2xl leading-6 font-bold
				  text-dark-1 dark:text-light-1 max-sm:hidden"
          >
            The Date Pot
          </p>
        </Link>
        <Menu
          burgerButtonClassName={'text-dark-1 dark:text-light-1'}
          customBurgerIcon={
            <IconHomeHeart
              stroke={2}
              strokeLinejoin="miter"
              height={28}
              width={28}
              className="text-dark-1 dark:text-light-1"
            />
          }
        >
          <NavOptions position="leftsidebar" pots={props.pots} />
        </Menu>
        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <div className="block md:hidden"></div>
        </div>
        <Logout placement="top" />
      </nav>
    </CustomThemeProvider>
  )
}
