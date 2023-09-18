"use server"

import RestaurantList from '@/components/restaurant/List'
import { getRestaurantList } from "@/lib/actions/restaurant.action";
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { IRestaurant } from "@/lib/models/restaurant";
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Restaurants() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo: IUser = await getUserInfo(user.id);
  const userGroup: IUserGroup = await getUserGroup(userInfo._id);
  const restaurants: IRestaurant[] = await getRestaurantList(userGroup._id);

  return (
    <div className="listPage">
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}
