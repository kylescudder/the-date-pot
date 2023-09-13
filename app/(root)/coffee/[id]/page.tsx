"use server"

import AddCoffee from '@/components/coffee/AddCoffee';
import { getCoffee, getCoffeeRatings } from '@/lib/actions/coffee.action';
import { ICoffee } from '@/lib/models/coffee';
import { ICoffeeRating } from '@/lib/models/coffee-rating';
import React from 'react'

export default async function Coffee({ params }: { params: { id: string } }) {
	const coffee: ICoffee = await getCoffee(params.id);
	const ratings: ICoffeeRating[] = await getCoffeeRatings(params.id)
  return <AddCoffee coffee={coffee} ratings={ratings} />;
}
