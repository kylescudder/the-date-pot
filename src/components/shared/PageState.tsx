import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import Loading from './Loading'

type Query = { isPending: boolean; isError: boolean; refetch: () => unknown }

// Shows the spinner until every query has loaded, or the error screen if one fails.
export default function PageState(props: {
  queries: Query[]
  what: string
  children: () => ReactNode
}) {
  if (props.queries.some((query) => query.isError))
    return (
      <div className='flex min-h-full items-center justify-center'>
        <div className='rounded-lg p-6 shadow-md'>
          <p className='from-primary-500 bg-linear-to-r to-red-500 bg-clip-text pb-2 text-6xl font-extrabold text-transparent'>
            Oops! Something went wrong.
          </p>
          <p className='mt-2 font-extrabold text-white'>
            Something went wrong getting {props.what}!
          </p>
          <Button
            className='from-primary-500 mt-3 rounded bg-linear-to-r to-red-500 px-4 py-2 text-white transition hover:bg-blue-600'
            onClick={() => props.queries.forEach((query) => query.refetch())}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  if (props.queries.some((query) => query.isPending)) return <Loading />
  return props.children()
}
