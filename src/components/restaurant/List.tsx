'use client'

import React from 'react'
import AddRestaurant from './AddRestaurant'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Cuisine, Restaurant, When } from '@/server/db/schema'
import { Restaurants } from '@/lib/models/restaurants'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { IconDots } from '@tabler/icons-react'

export default function RestaurantList(props: {
  restaurants: Restaurant[]
  cuisineList: Cuisine[]
  whenList: When[]
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newRestaurant: Restaurants = {
    id: '',
    name: '',
    address: '',
    archive: false,
    userGroupId: '',
    cuisines: [],
    whens: [],
    notes: []
  }

  const columns: ColumnDef<Restaurant>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Address' />
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <IconDots className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.restaurants}
      potName='Restaurant'
      rowFormatter={null}
      columns={columns}
      filterColumns={['name', 'address']}
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
