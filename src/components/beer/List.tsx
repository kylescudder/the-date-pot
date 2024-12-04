'use client'

import React from 'react'
import AddBeer from './AddBeer'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Beer, BeerType, Brewery, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'
import { StarRating } from '../ui/star-rating'

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
            <StarRating
              max={5}
              name='average'
              value={row.getValue('avgRating')}
              increment={0.5}
              readOnly
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
            <StarRating
              max={5}
              name='wankyness'
              value={row.getValue('avgWankyness')}
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
              max={5}
              name='taste'
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
