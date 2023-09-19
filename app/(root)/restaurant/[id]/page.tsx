"use server"

import AddRestaurant from "@/components/restaurant/AddRestaurant";
import { getCuisineList } from "@/lib/actions/cuisine.action";
import { getLongLat } from "@/lib/actions/map.action";
import { getRestaurant } from "@/lib/actions/restaurant.action";
import { ICuisine } from "@/lib/models/cuisine";
import { IRestaurant } from "@/lib/models/restaurant";
import React from 'react'

export default async function Restaurant({ params }: { params: { id: string } }) {
  const restaurant: IRestaurant = await getRestaurant(params.id);
  const cuisineList: ICuisine[] = await getCuisineList();
  const longLat: number[] = await getLongLat(restaurant.address);
  return <AddRestaurant restaurant={restaurant} longLat={longLat} cuisineList={cuisineList} />;
}
