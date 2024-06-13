'use client'

import React from 'react'
import AddActivity from './AddActivity'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Activity, Expense } from '@/server/db/schema'

export default function ActivityList(props: {
  activities: Activity[]
  expenseList: Expense[]
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newActivity: Activity = {
    id: '',
    activityName: '',
    address: '',
    archive: false,
    userGroupId: '',
    expenseId: ''
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
