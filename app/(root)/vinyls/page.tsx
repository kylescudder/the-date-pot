'use server'

import VinylList from '@/components/vinyl/List'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { getVinylList } from '@/lib/actions/vinyl.action'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { IVinyl } from '@/lib/models/vinyl'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Vinyls() {
  const user = await currentUser()
  if (!user) return null

  const userInfo: IUser = await getUserInfo(user.id)
  const userGroup: IUserGroup = await getUserGroup(userInfo._id)
  const vinyls: IVinyl[] = await getVinylList(userGroup._id)

  return (
    <div className="listPage">
      <VinylList vinyls={vinyls} />
    </div>
  )
}
