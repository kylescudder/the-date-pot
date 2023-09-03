"use server"

import VinylList from '@/components/vinyl/List'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { getVinylList } from '@/lib/actions/vinyl.action'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Vinyls() {
	const user = await currentUser()
  if (!user) return null;

	const userInfo: IUser = await getUserInfo(user.id);
	const userGroup: IUserGroup = await getUserGroup(userInfo._id)
	const vinyls = await getVinylList(userGroup._id)
	console.log("vinyls: ", vinyls);
	return (
		<section>
			<h2>Vinyls</h2>
			<VinylList vinyls={vinyls} />
		</section>
	)
}
