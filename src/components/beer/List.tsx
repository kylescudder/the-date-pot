'use client'

import React from 'react'
import AddBeer from './AddBeer'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { ICellRendererParams } from 'ag-grid-community'
import { Rating } from '@mantine/core'
import { Beer, BeerType, Brewery, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'

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
    beerName: '',
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
  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.beers}
      potName='Beer'
      rowFormatter={null}
      columns={[
        {
          headerName: 'Name',
          field: 'beerName',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Rating',
          field: 'avgRating',
          cellClass: 'justify-center',
          resizable: false,
          cellRenderer: (params: ICellRendererParams) => {
            return (
              <Rating
                name='average'
                fractions={2}
                size='lg'
                readOnly
                value={params.value}
              />
            )
          },
          minWidth: 150
        },
        {
          headerName: 'Wankyness',
          field: 'avgWankyness',
          cellClass: 'justify-center',
          resizable: false,
          cellRenderer: (params: ICellRendererParams) => {
            return (
              <Rating
                name='wankyness'
                fractions={2}
                size='lg'
                readOnly
                value={params.value}
              />
            )
          },
          minWidth: 150
        },
        {
          headerName: 'Taste',
          field: 'avgTaste',
          cellClass: 'justify-center',
          resizable: false,
          cellRenderer: (params: ICellRendererParams) => {
            return (
              <Rating
                name='taste'
                fractions={2}
                size='lg'
                readOnly
                value={params.value}
              />
            )
          },
          minWidth: 150
        }
      ]}
      filterColumns={['beerName']}
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
