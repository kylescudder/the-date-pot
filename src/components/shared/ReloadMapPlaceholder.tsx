import React from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

const ReloadMapPlaceholder = () => {
  const router = useRouter()

  const handleClick = () => {
    router.refresh()
  }
  return (
    <div className='h-400 flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-gray-400 bg-gray-300'>
      <IconRefresh className='text-2xl text-gray-600' />
      <p onClick={handleClick} className='mt-2'>
        To view the map, click here
      </p>
    </div>
  )
}

export default ReloadMapPlaceholder
