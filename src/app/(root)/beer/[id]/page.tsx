'use server'

import AddBeer from '@/components/beer/AddBeer'
import { getBeerTypeList } from '@/lib/actions/beer-type'
import { getBeer, getBeerRatings } from '@/lib/actions/beer.action'
import { getBreweryList } from '@/lib/actions/brewer.action'
import { getGroupUsers } from '@/lib/actions/user.actions'
import { BeerRatings } from '@/lib/models/beerRatings'
import { Beers } from '@/lib/models/beers'
import { BeerType, Brewery } from '@/server/db/schema'
import React from 'react'

export default async function Beer({ params }: { params: { id: string } }) {
  const beer: Beers | null = await getBeer(params.id)
  if (!beer) return <div>Beer not found</div>
  const ratings: BeerRatings[] = await getBeerRatings(params.id)
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
