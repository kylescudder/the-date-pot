'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Icon from './Icon'
import { Pot } from '@/server/db/schema'

export default function NavOptions(props: { position: string; pots: Pot[] }) {
  const pathname = usePathname()
  return (
    <div className='contents w-full'>
      <a
        href='/'
        className={`${props.position}_link ${pathname === '/' && 'hover:bg-primary-hover text-emerald-500'}`}
      >
        <Icon
          name={'IconHome'}
          stroke='2'
          strokeLinejoin='miter'
          isActive={false}
        />
        <p className='relative flex font-black'>Home</p>
      </a>
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
          <a
            href={`/${potNamePluralised}`}
            key={pot.id}
            className={`${props.position}_link ${isActive && 'hover:bg-primary-hover text-emerald-500'}`}
          >
            <Icon
              name={pot.icon}
              stroke='2'
              strokeLinejoin='miter'
              isActive={isActive}
            />
            <p
              className={`${isActive && 'text-white'} relative flex font-black`}
            >
              {pot.potName}
            </p>
          </a>
        )
      })}
    </div>
  )
}
