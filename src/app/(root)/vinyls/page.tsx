'use server'

import React from 'react'
import VinylList from '@/components/vinyl/List'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { getVinylList } from '@/lib/actions/vinyl.action'
import { currentUser } from '@clerk/nextjs/server'
import { Vinyl } from '@/server/db/schema'

export default async function Vinyls() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)
  const userGroup = await getUserGroup(userInfo!.id)
  const vinyls: Vinyl[] = await getVinylList(userGroup.id)

  return (
    <div className='listPage'>
      <VinylList vinyls={vinyls} />
    </div>
  )
}
