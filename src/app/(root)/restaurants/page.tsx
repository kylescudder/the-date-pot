'use server'

import RestaurantList from '@/components/restaurant/List'
import { getCuisineList } from '@/lib/actions/cuisine.action'
import { getLongLat } from '@/lib/actions/map.action'
import { getRestaurantList } from '@/lib/actions/restaurant.action'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { getWhenList } from '@/lib/actions/when.action'
import { ICuisine } from '@/lib/models/cuisine'
import { IRestaurant } from '@/lib/models/restaurant'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { IWhen } from '@/lib/models/when'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Restaurants() {
  const user = await currentUser()
  if (!user) return null

  const userInfo: IUser = await getUserInfo(user.id)
  const userGroup: IUserGroup = await getUserGroup(userInfo._id)
  const restaurants: IRestaurant[] = await getRestaurantList(userGroup._id)
  const cuisineList: ICuisine[] = await getCuisineList()
  const whenList: IWhen[] = await getWhenList()
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
