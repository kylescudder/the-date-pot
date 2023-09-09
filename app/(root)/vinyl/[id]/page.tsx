"use server"

import AddVinyl from '@/components/vinyl/AddVinyl'
import { getVinyl } from '@/lib/actions/vinyl.action';
import { IVinyl } from '@/lib/models/vinyl'
import React from 'react'

export default async function Vinyl({ params }: { params: { id: string } }) {
	const vinyl: IVinyl = await getVinyl(params.id);
  return <AddVinyl vinyl={vinyl} />;
}
