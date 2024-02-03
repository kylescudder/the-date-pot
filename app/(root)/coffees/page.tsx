"use server"

import React from 'react'
import CoffeeList from '@/components/coffee/List'
import { getCoffeeList } from '@/lib/actions/coffee.action'
import { getGroupUsers, getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { ICoffee } from '@/lib/models/coffee'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs'

export default async function Coffees() {
	const user = await currentUser()
  if (!user) return null;

	const userInfo: IUser = await getUserInfo(user.id);
	const userGroup: IUserGroup = await getUserGroup(userInfo._id);
	const coffees: ICoffee[] = await getCoffeeList(userGroup._id);
	const users: IUser[] = await getGroupUsers() || [];
	const longLat: number[] = [0, 0];

	return (
    <div className="listPage">
      <CoffeeList coffees={coffees} users={users} longLat={longLat} />
    </div>
  );
}
