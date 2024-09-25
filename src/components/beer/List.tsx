'use client'

import React from 'react'
import AddBeer from './AddBeer'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Rating } from '@mantine/core'
import { Beer, BeerType, Brewery, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'

export default function BeerList(props: {
  beers: Beer[]
  users: User[]
  breweryList: Brewery[]
  beerTypeList: BeerType[]
}) {
  const [loading, setLoading] = React.useState(false)

  const ratings: BeerRatings[] = []

  const newBeer = {
    id: '',
    name: '',
    abv: 0,
    breweries: [],
    beerTypes: [],
    avgWankyness: 0,
    avgTaste: 0,
    avgRating: 0,
    userGroupId: '',
    addedById: '',
    archive: false
  }

  const columns: ColumnDef<Beer>[] = [
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
      accessorKey: 'avgWankyness',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Wankyness' />
      ),
      cell: ({ row }) => {
        return (
          <div className='justify-center'>
            <Rating
              name='wankyness'
              fractions={2}
              size='lg'
              readOnly
              value={row.getValue('avgWankyness')}
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
      records={props.beers}
      potName='Beer'
      rowFormatter={null}
      columns={columns}
      filterColumns={['name']}
      addRecordComp={
        <AddBeer
          beer={newBeer}
          ratings={ratings}
          users={props.users}
          breweryList={props.breweryList}
          beerTypeList={props.beerTypeList}
        />
      }
    />
  )
}
