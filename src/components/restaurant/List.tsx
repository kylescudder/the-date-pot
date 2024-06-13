'use client'

import React from 'react'
import AddRestaurant from './AddRestaurant'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Restaurants } from '@/lib/models/restaurants'
import { Cuisine, When } from '@/server/db/schema'

export default function RestaurantList(props: {
  restaurants: Restaurants[]
  cuisineList: Cuisine[]
  whenList: When[]
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newRestaurant: Restaurants = {
    id: '',
    restaurantName: '',
    address: '',
    archive: false,
    userGroupId: '',
    cuisines: [],
    whens: [],
    notes: []
  }

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.restaurants}
      potName='Restaurant'
      rowFormatter={null}
      columns={[
        {
          headerName: 'Name',
          field: 'restaurantName',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Address',
          field: 'address',
          resizable: false,
          minWidth: 200
        }
      ]}
      filterColumns={['restaurantName', 'address']}
      addRecordComp={
        <AddRestaurant
          restaurant={newRestaurant}
          longLat={props.longLat}
          cuisineList={props.cuisineList}
          whenList={props.whenList}
        />
      }
    />
  )
}
