"use server"

import CoffeeList from '@/components/coffee/List'
import { getCoffeeList } from '@/lib/actions/coffee.action'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { ICoffee } from '@/lib/models/coffee'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Coffees() {
	const user = await currentUser()
  if (!user) return null;

	const userInfo: IUser = await getUserInfo(user.id);
	const userGroup: IUserGroup = await getUserGroup(userInfo._id);
	const coffees: ICoffee[] = await getCoffeeList(userGroup._id);

	return (
    <div className="coffeePage">
      <CoffeeList coffees={coffees} />
    </div>
  );
}
