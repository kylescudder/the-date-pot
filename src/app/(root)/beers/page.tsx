'use server'

import BeerList from '@/components/beer/List'
import { getBeerTypeList } from '@/lib/actions/beer-type'
import { getBeerList } from '@/lib/actions/beer.action'
import { getBreweryList } from '@/lib/actions/brewer.action'
import {
  getGroupUsers,
  getUserGroup,
  getUserInfo
} from '@/lib/actions/user.actions'
import { Beer, BeerType, Brewery, User } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

export default async function Beers() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)
  const userGroup = await getUserGroup(userInfo!.id)
  const beers: Beer[] = await getBeerList(userGroup.id)
  const breweryList: Brewery[] = await getBreweryList()
  const beerTypeList: BeerType[] = await getBeerTypeList()
  const users = (await getGroupUsers()) || []

  return (
    <div className='listPage'>
      <BeerList
        beers={beers}
        users={users}
        breweryList={breweryList}
        beerTypeList={beerTypeList}
      />
    </div>
  )
}
