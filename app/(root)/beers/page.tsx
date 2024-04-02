'use server'

import BeerList from '@/components/beer/List'
import { getBeerList } from '@/lib/actions/beer.action'
import { getBreweryList } from '@/lib/actions/brewer.action'
import {
  getGroupUsers,
  getUserGroup,
  getUserInfo
} from '@/lib/actions/user.actions'
import { IBeer } from '@/lib/models/beer'
import { IBrewery } from '@/lib/models/brewery'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Beers() {
  const user = await currentUser()
  if (!user) return null

  const userInfo: IUser = await getUserInfo(user.id)
  const userGroup: IUserGroup = await getUserGroup(userInfo._id)
  const beers: IBeer[] = await getBeerList(userGroup._id)
  const breweryList: IBrewery[] = await getBreweryList()
  const users: IUser[] = (await getGroupUsers()) || []

  return (
    <div className="listPage">
      <BeerList beers={beers} users={users} breweryList={breweryList} />
    </div>
  )
}
