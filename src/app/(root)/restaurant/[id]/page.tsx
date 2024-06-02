'use server'

import AddRestaurant from '@/components/restaurant/AddRestaurant'
import { getCuisineList } from '@/lib/actions/cuisine.action'
import { getLongLat } from '@/lib/actions/map.action'
import { getRestaurant } from '@/lib/actions/restaurant.action'
import { getWhenList } from '@/lib/actions/when.action'
import { Cuisine, When } from '@/server/db/schema'
import React from 'react'

export default async function Restaurant({
  params
}: {
  params: { id: string }
}) {
  const restaurant = await getRestaurant(params.id)
  const cuisineList: Cuisine[] = await getCuisineList()
  const whenList: When[] = await getWhenList()
  let longLat: number[] = []
  if (restaurant!.address !== undefined && restaurant!.address !== '') {
    longLat = await getLongLat(restaurant!.address)
  }
  return (
    <AddRestaurant
      restaurant={restaurant}
      longLat={longLat}
      cuisineList={cuisineList}
      whenList={whenList}
    />
  )
}
