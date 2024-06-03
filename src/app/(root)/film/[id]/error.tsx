'use client'

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className='flex min-h-full items-center justify-center '>
      <div className='rounded-lg p-6 shadow-md'>
        <p className='bg-gradient-to-r from-primary-500 to-red-500 bg-clip-text pb-2 text-6xl font-extrabold text-transparent'>
          Oops! Something went wrong.
        </p>
        <p className='mt-2 font-extrabold text-light-1'>
          Something went wrong getting that film!
        </p>
        <button
          className='hover:bg-blue-600 mt-3 rounded bg-gradient-to-r from-primary-500 to-red-500 px-4 py-2 text-white transition'
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
