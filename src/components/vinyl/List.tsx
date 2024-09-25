'use client'

import React from 'react'
import AddVinyl from './AddVinyl'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Vinyl } from '@/server/db/schema'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'

export default function VinylList(props: { vinyls: Vinyl[] }) {
  const [loading, setLoading] = React.useState(false)

  const newVinyl = {
    id: '',
    name: '',
    artist: '',
    purchased: false,
    archive: false,
    addedById: '',
    userGroupId: ''
  }

  const formatter = (params: { data: Vinyl }): any => {
    return params.data.purchased
      ? { backgroundColor: '#5865F2', color: 'white' }
      : { backgroundColor: '#FDFD96', color: 'black' }
  }

  const columns: ColumnDef<Vinyl>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      accessorKey: 'artist',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Artist' />
      )
    },
    {
      accessorKey: 'purchased',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Purchased' />
      ),
      cell: ({ row }) => {
        const formatted = row.getValue('purchased') === true ? 'Yes' : 'No'

        return <div>{formatted}</div>
      }
    }
  ]

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.vinyls}
      potName='Vinyl'
      rowFormatter={formatter}
      columns={columns}
      filterColumns={['name', 'artist']}
      addRecordComp={<AddVinyl vinyl={newVinyl} />}
    />
  )
}
