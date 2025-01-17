'use client'

import { log } from '@logtail/next'
import Error from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string }
}) {
  log.error('Exception: ', error)

  return (
    <html>
      <body>
        {/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
        <Error statusCode={undefined as any} />
      </body>
    </html>
  )
}
