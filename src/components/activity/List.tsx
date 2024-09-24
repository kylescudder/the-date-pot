'use client'

import React from 'react'
import AddActivity from './AddActivity'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Activity, Expense } from '@/server/db/schema'
import { DataTableColumnHeader } from '../ui/data-table-header'
import { ColumnDef } from '@tanstack/react-table'

export default function ActivityList(props: {
  activities: Activity[]
  expenseList: Expense[]
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newActivity: Activity = {
    id: '',
    name: '',
    address: '',
    archive: false,
    userGroupId: '',
    expenseId: ''
  }

  const columns: ColumnDef<Activity>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Address' />
      )
    }
  ]

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.activities}
      potName='Activity'
      rowFormatter={null}
      columns={columns}
      filterColumns={['name', 'address']}
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
