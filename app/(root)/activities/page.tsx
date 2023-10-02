"use server"

import ActivityList from "@/components/activity/List";
import { getActivityList } from "@/lib/actions/activity.action";
import { getExpenseList } from "@/lib/actions/expense.action";
import { getGroupUsers, getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { IActivity } from "@/lib/models/activity";
import { IExpense } from "@/lib/models/expense";
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

export default async function Activities() {
	const user = await currentUser()
  if (!user) return null;

	const userInfo: IUser = await getUserInfo(user.id);
	const userGroup: IUserGroup = await getUserGroup(userInfo._id);
	const activities: IActivity[] = await getActivityList(userGroup._id);
  const expenseList: IExpense[] = await getExpenseList();
  const longLat: number[] = [0, 0];

	return (
    <div className="listPage">
      <ActivityList activities={activities} expenseList={expenseList} longLat={longLat} />
    </div>
  );
}
