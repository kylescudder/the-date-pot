'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export const DarkModeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div>
      <input
        type='checkbox'
        id='toggle'
        checked={theme === 'light' ? false : true}
        className='toggle--checkbox'
        onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <label htmlFor='toggle' className='toggle--label float-right mr-2'>
        <span className='toggle--label-background' />
      </label>
    </div>
  )
}
