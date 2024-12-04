'use client'

import React from 'react'
import AddCoffee from './AddCoffee'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Coffee, User } from '@/server/db/schema'
import { CoffeeRatings } from '@/lib/models/coffeeRatings'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'
import { StarRating } from '../ui/star-rating'

export default function CoffeeList(props: {
  coffees: Coffee[]
  users: User[]
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false)

  const ratings: CoffeeRatings[] = []

  const newCoffee = {
    id: '',
    name: '',
    avgExperience: 0,
    avgTaste: 0,
    avgRating: 0,
    userGroupId: '',
    addedById: '',
    archive: false,
    address: ''
  }

  const columns: ColumnDef<Coffee>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      accessorKey: 'avgRating',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Rating' />
      ),
      cell: ({ row }) => {
        return (
          <div className='justify-center'>
            <StarRating
              name='average'
              max={5}
              value={row.getValue('avgRating')}
              increment={0.5}
              readOnly
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'avgExperience',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Exerience' />
      ),
      cell: ({ row }) => {
        return (
          <div className='justify-center'>
            <StarRating
              name='experience'
              max={5}
              value={row.getValue('avgExperience')}
              increment={0.5}
              readOnly
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'avgTaste',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Taste' />
      ),
      cell: ({ row }) => {
        return (
          <div className='justify-center'>
            <StarRating
              name='taste'
              max={5}
              value={row.getValue('avgTaste')}
              increment={0.5}
              readOnly
            />
          </div>
        )
      }
    }
  ]

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.coffees}
      potName='Coffee'
      rowFormatter={null}
      columns={columns}
      filterColumns={['name']}
      addRecordComp={
        <AddCoffee
          coffee={newCoffee}
          ratings={ratings}
          users={props.users}
          longLat={props.longLat}
        />
      }
    />
  )
}
