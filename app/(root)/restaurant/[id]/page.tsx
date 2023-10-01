"use server"

import AddRestaurant from "@/components/restaurant/AddRestaurant";
import { getCuisineList } from "@/lib/actions/cuisine.action";
import { getLongLat } from "@/lib/actions/map.action";
import { getRestaurant } from "@/lib/actions/restaurant.action";
import { getWhenList } from "@/lib/actions/when.action";
import { ICuisine } from "@/lib/models/cuisine";
import { IRestaurant } from "@/lib/models/restaurant";
import { IWhen } from "@/lib/models/when";
import React from 'react'

export default async function Restaurant({ params }: { params: { id: string } }) {
  const restaurant: IRestaurant = await getRestaurant(params.id);
  const cuisineList: ICuisine[] = await getCuisineList();
  const whenList: IWhen[] = await getWhenList();
  let longLat: number[] = []
  if (restaurant.address !== undefined && restaurant.address !== "") {
    longLat = await getLongLat(restaurant.address);
  }
  return <AddRestaurant restaurant={restaurant} longLat={longLat} cuisineList={cuisineList} whenList={whenList} />;
}
