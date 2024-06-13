'use server'

import AddCoffee from '@/components/coffee/AddCoffee'
import { getCoffee, getCoffeeRatings } from '@/lib/actions/coffee.action'
import { getLongLat } from '@/lib/actions/map.action'
import { getGroupUsers } from '@/lib/actions/user.actions'
import { CoffeeRatings } from '@/lib/models/coffeeRatings'
import React from 'react'

export default async function Coffee({ params }: { params: { id: string } }) {
  const coffee = await getCoffee(params.id)
  const ratings: CoffeeRatings[] = await getCoffeeRatings(params.id)
  const users = (await getGroupUsers()) || []
  let longLat: number[] = []
  if (coffee!.address !== null && coffee!.address !== '') {
    longLat = await getLongLat(coffee!.address)
  }

  return (
    <AddCoffee
      coffee={coffee}
      ratings={ratings}
      users={users}
      longLat={longLat}
    />
  )
}
