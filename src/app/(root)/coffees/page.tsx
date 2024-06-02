'use server'

import React from 'react'
import CoffeeList from '@/components/coffee/List'
import { getCoffeeList } from '@/lib/actions/coffee.action'
import {
  getGroupUsers,
  getUserGroup,
  getUserInfo
} from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs/server'
import { Coffee, User } from '@/server/db/schema'

export default async function Coffees() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)
  const userGroup = await getUserGroup(userInfo!.id)
  const coffees: Coffee[] = await getCoffeeList(userGroup.id)
  const users = (await getGroupUsers()) || []
  const longLat: number[] = [0, 0]

  return (
    <div className='listPage'>
      <CoffeeList coffees={coffees} users={users} longLat={longLat} />
    </div>
  )
}
