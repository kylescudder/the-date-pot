'use server'

import AddActivity from '@/components/activity/AddActivity'
import { getActivity } from '@/lib/actions/activity.action'
import { getExpenseList } from '@/lib/actions/expense.action'
import { getLongLat } from '@/lib/actions/map.action'
import { Expense } from '@/server/db/schema'

export default async function Activity(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const activity = await getActivity(params.id)
  const expenseList: Expense[] = await getExpenseList()
  let longLat: number[] = []
  if (activity!.address !== null && activity!.address !== '') {
    longLat = await getLongLat(activity!.address)
  }
  return (
    <AddActivity
      activity={activity}
      expenseList={expenseList}
      longLat={longLat}
    />
  )
}
