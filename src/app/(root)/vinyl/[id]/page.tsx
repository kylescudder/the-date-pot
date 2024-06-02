'use server'

import React from 'react'
import AddVinyl from '@/components/vinyl/AddVinyl'
import { getVinyl } from '@/lib/actions/vinyl.action'

export default async function Vinyl({ params }: { params: { id: string } }) {
  const vinyl = await getVinyl(params.id)
  return <AddVinyl vinyl={vinyl} />
}
