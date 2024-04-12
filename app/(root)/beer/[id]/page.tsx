'use server'

import AddBeer from '@/components/beer/AddBeer'
import { getBeerTypeList } from '@/lib/actions/beer-type'
import { getBeer, getBeerRatings } from '@/lib/actions/beer.action'
import { getBreweryList } from '@/lib/actions/brewer.action'
import { getGroupUsers } from '@/lib/actions/user.actions'
import { IBeer } from '@/lib/models/beer'
import { IBeerRating } from '@/lib/models/beer-rating'
import { IBeerType } from '@/lib/models/beer-type'
import { IBrewery } from '@/lib/models/brewery'
import { IUser } from '@/lib/models/user'
import React from 'react'

export default async function Beer({ params }: { params: { id: string } }) {
  const beer: IBeer = await getBeer(params.id)
  const ratings: IBeerRating[] = await getBeerRatings(params.id)
  const breweryList: IBrewery[] = await getBreweryList()
  const beerTypeList: IBeerType[] = await getBeerTypeList()
  const users: IUser[] = (await getGroupUsers()) || []
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
