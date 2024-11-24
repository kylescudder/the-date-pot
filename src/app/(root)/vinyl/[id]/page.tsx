'use server'

import React from 'react'
import AddVinyl from '@/components/vinyl/AddVinyl'
import { getVinyl } from '@/lib/actions/vinyl.action'

export default async function Vinyl(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const vinyl = await getVinyl(params.id)
  if (!vinyl) {
    return null
  }
  return <AddVinyl vinyl={vinyl} />
}
