'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { IBeer } from '@/lib/models/beer'
import AddBeer from './AddBeer'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { IBeerRating } from '@/lib/models/beer-rating'
import { IUser } from '@/lib/models/user'
import { ICellRendererParams } from 'ag-grid-community'
import { Rating } from '@mantine/core'
import { IBrewery } from '@/lib/models/brewery'

export default function BeerList(props: {
  beers: IBeer[]
  users: IUser[]
  breweryList: IBrewery[]
}) {
  const [loading, setLoading] = React.useState(false)

  const router = useRouter()
  const ratings: IBeerRating[] = []

  const newBeer = {
    _id: '',
    beerName: '',
    abv: 0,
    breweries: [],
    avgWankyness: 0,
    avgTaste: 0,
    avgRating: 0,
    userGroupID: '',
    addedByID: '',
    archive: false
  }
  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.beers}
      potName="Beer"
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
                name="average"
                fractions={2}
                size="lg"
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
                name="wankyness"
                fractions={2}
                size="lg"
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
                name="taste"
                fractions={2}
                size="lg"
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
        />
      }
    />
  )
}
