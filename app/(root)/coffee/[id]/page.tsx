"use server"

import AddCoffee from '@/components/coffee/AddCoffee';
import { getCoffee } from '@/lib/actions/coffee.action';
import { ICoffee } from '@/lib/models/coffee';
import React from 'react'

export default async function Coffee({ params }: { params: { id: string } }) {
	const coffee: ICoffee = await getCoffee(params.id);
  return <AddCoffee coffee={coffee} />;
}
