'use server'

import RestaurantList from '@/components/restaurant/List'
import { getCuisineList } from '@/lib/actions/cuisine.action'
import { getRestaurantList } from '@/lib/actions/restaurant.action'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { getWhenList } from '@/lib/actions/when.action'
import { Cuisine, Restaurant, When } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

export default async function Restaurants() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)
  const userGroup = await getUserGroup(userInfo!.id)
  const restaurants: Restaurant[] = await getRestaurantList(userGroup.id)
  const cuisineList: Cuisine[] = await getCuisineList()
  const whenList: When[] = await getWhenList()
  const longLat: number[] = [0, 0]

  return (
    <div className='listPage'>
      <RestaurantList
        restaurants={restaurants}
        longLat={longLat}
        cuisineList={cuisineList}
        whenList={whenList}
      />
    </div>
  )
}
