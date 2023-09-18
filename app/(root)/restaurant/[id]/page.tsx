"use server"

import AddRestaurant from "@/components/restaurant/AddRestaurant";
import { getLongLat } from "@/lib/actions/map.action";
import { getRestaurant } from "@/lib/actions/restaurant.action";
import { IRestaurant } from "@/lib/models/restaurant";
import React from 'react'

export default async function Restaurant({ params }: { params: { id: string } }) {
  const restaurant: IRestaurant = await getRestaurant(params.id);
  const longLat: number[] = await getLongLat(restaurant.address);
  return <AddRestaurant restaurant={restaurant} longLat={longLat} />;
}
