'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import Icon from './Icon'
import { Pot } from '@/server/db/schema'
import { SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'

export default function NavOptions(props: { position: string; pots: Pot[] }) {
  const pathname = usePathname()
  return (
    <div className='contents w-full'>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href='/' className='mb-3 flex items-center gap-2 text-xl'>
            <Icon
              name={'IconHome'}
              stroke='2'
              strokeLinejoin='miter'
              isActive={false}
            />
            <p className='relative font-black'>Home</p>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {props.pots.map((pot) => {
        const potNameDepluralised = pot.potName.endsWith('s')
          ? pot.potName.substring(0, pot.potName.length - 1).toLowerCase()
          : pot.potName.toLowerCase()
        let potNamePluralised = ''
        if (pot.potName.endsWith('y')) {
          // Pluralisation of names that end in y
          potNamePluralised = `${pot.potName.substring(
            0,
            pot.potName.length - 1
          )}ies`.toLowerCase()
        } else if (!pot.potName.endsWith('s')) {
          // Pluralisation of names that don't end in s
          potNamePluralised = `${pot.potName}s`.toLowerCase()
        } else {
          potNamePluralised = pot.potName.toLowerCase()
        }
        const isActive =
          (pathname.includes(potNameDepluralised) &&
            potNameDepluralised.length > 1) ||
          pathname === potNameDepluralised
        return (
          <SidebarMenuItem key={pot.id}>
            <SidebarMenuButton asChild>
              <a
                href={`/${potNamePluralised}`}
                key={pot.id}
                className='my-3 flex items-center gap-2 text-xl'
              >
                <Icon
                  name={pot.icon}
                  stroke='2'
                  strokeLinejoin='miter'
                  isActive={isActive}
                />
                <p
                  className={`${isActive && 'text-primary'} relative font-black`}
                >
                  {pot.potName}
                </p>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </div>
  )
}
