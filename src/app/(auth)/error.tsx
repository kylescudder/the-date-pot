'use client'

import { Button } from '@/components/ui/button'
import { log } from '@logtail/next'

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  log.error('Exception: ', error)

  return (
    <div className='flex min-h-full items-center justify-center'>
      <div className='rounded-lg p-6 shadow-md'>
        <p className='from-primary-500 bg-gradient-to-r to-red-500 bg-clip-text pb-2 text-6xl font-extrabold text-transparent'>
          Oops! Something went wrong.
        </p>
        <Button
          className='from-primary-500 mt-3 rounded bg-gradient-to-r to-red-500 px-4 py-2 text-white transition hover:bg-blue-600'
          onClick={reset}
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
