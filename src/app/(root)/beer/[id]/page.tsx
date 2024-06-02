'use server'

import AddBeer from '@/components/beer/AddBeer'
import { getBeerTypeList } from '@/lib/actions/beer-type'
import { getBeer, getBeerRatings } from '@/lib/actions/beer.action'
import { getBreweryList } from '@/lib/actions/brewer.action'
import { getGroupUsers } from '@/lib/actions/user.actions'
import { BeerRating, BeerType, Brewery } from '@/server/db/schema'
import React from 'react'

export default async function Beer({ params }: { params: { id: string } }) {
  const beer = await getBeer(params.id)
  const ratings: BeerRating[] = await getBeerRatings(params.id)
  const breweryList: Brewery[] = await getBreweryList()
  const beerTypeList: BeerType[] = await getBeerTypeList()
  const users = (await getGroupUsers()) || []
  return (
    <AddBeer
      beer={beer}
      ratings={ratings}
      users={users}
      breweryList={breweryList}
      beerTypeList={beerTypeList}
    />
  )
}
