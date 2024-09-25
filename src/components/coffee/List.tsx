'use client'

import React from 'react'
import AddCoffee from './AddCoffee'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Rating } from '@mantine/core'
import { Coffee, User } from '@/server/db/schema'
import { CoffeeRatings } from '@/lib/models/coffeeRatings'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'

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
            <Rating
              name='average'
              fractions={2}
              size='lg'
              readOnly
              value={row.getValue('avgRating')}
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
            <Rating
              name='experience'
              fractions={2}
              size='lg'
              readOnly
              value={row.getValue('avgExperience')}
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
            <Rating
              name='taste'
              fractions={2}
              size='lg'
              readOnly
              value={row.getValue('avgTaste')}
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
