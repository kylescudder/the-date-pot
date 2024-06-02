'use server'

import ActivityList from '@/components/activity/List'
import { getActivityList } from '@/lib/actions/activity.action'
import { getExpenseList } from '@/lib/actions/expense.action'
import {
  getGroupUsers,
  getUserGroup,
  getUserInfo
} from '@/lib/actions/user.actions'
import { Activity, Expense, User, UserGroups } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

export default async function Activities() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)
  const userGroup = await getUserGroup(userInfo!.id)
  const activities: Activity[] = await getActivityList(userGroup.id)
  const expenseList: Expense[] = await getExpenseList()
  const longLat: number[] = [0, 0]

  return (
    <div className='listPage'>
      <ActivityList
        activities={activities}
        expenseList={expenseList}
        longLat={longLat}
      />
    </div>
  )
}
