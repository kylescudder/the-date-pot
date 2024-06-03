'use client'

import { IActivity } from '@/lib/models/activity'
import React from 'react'
import AddActivity from './AddActivity'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { IExpense } from '@/lib/models/expense'

export default function ActivityList(props: {
  activities: IActivity[]
  expenseList: IExpense[]
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newActivity: IActivity = {
    _id: '',
    activityName: '',
    address: '',
    archive: false,
    userGroupID: '',
    expense: ''
  }

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.activities}
      potName='Activity'
      rowFormatter={null}
      columns={[
        {
          headerName: 'Name',
          field: 'activityName',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Address',
          field: 'address',
          resizable: false,
          minWidth: 200
        }
      ]}
      filterColumns={['activityName', 'address']}
      addRecordComp={
        <AddActivity
          activity={newActivity}
          longLat={props.longLat}
          expenseList={props.expenseList}
        />
      }
    />
  )
}
