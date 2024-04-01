'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColDef, RowClickedEvent, RowStyle } from 'ag-grid-community'
import { IconFilePlus, IconSearch } from '@tabler/icons-react'
import FullScreenModal from '../shared/FullScreenModal'
import { Button, Input } from '@mantine/core'
import Grid from './Grid'

export default function List(props: {
  records: any[]
  potName: string
  columns: ColDef[]
  filterColumns: string[]
  addRecordComp: React.ReactElement
  rowFormatter: any
}) {
  const [searchValue, setSearchValue] = useState('')
  const [filteredRecords, setFilteredRecords] = useState(props.records)
  const [open, setOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleSearchClickOpen = () => {
    setSearchOpen(true)
    focusRef.current?.focus()
  }

  const router = useRouter()

  useEffect(() => {
    if (searchValue !== '') {
      const lowercaseSearchValue = searchValue.toLowerCase()
      const filtered = props.records.filter((record) =>
        props.filterColumns.some((element) => {
          if (record[element] !== undefined) {
            return record[element].toLowerCase().includes(lowercaseSearchValue)
          }
          return false
        })
      )
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(props.records)
    }
  }, [searchValue, props.records, props.filterColumns])

  const onRowClicked = (params: RowClickedEvent) => {
    setLoading(true)
    // Access row data using params.data
    const rowData = params.data
    router.push(`${props.potName.toLowerCase()}/${rowData._id}`)
  }

  const pullData = (data: boolean) => {
    setOpen(data)
  }

  const focusRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <div className="flex mb-4">
        <div
          className={`relative ${
            searchOpen ? 'w-4/5' : 'w-0 overflow-hidden'
          } ml-auto transition-all duration-300 ease-in-out`}
        >
          <Input
            ref={focusRef}
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`${searchOpen ? 'w-full' : 'w-0'} pl-2
            dark:text-light-2 text-dark-2`}
            radius="md"
            size="sm"
          />
        </div>
        <Button
          radius="md"
          className={`${
            searchOpen ? 'hidden' : 'absolute right-6'
          } bg-primary-500 hover:bg-primary-hover text-light-1`}
          onClick={handleSearchClickOpen}
        >
          <IconSearch width={24} height={24} strokeLinejoin="miter" />
        </Button>
        <Button
          radius="md"
          className="bg-primary-500 hover:bg-primary-hover text-light-1 absolute left-6"
          onClick={handleClickOpen}
        >
          <IconFilePlus width={24} height={24} strokeLinejoin="miter" />
        </Button>
      </div>
      <FullScreenModal
        open={open}
        func={pullData}
        form={props.addRecordComp}
        title={`Add ${props.potName}`}
      />
      <Grid
        records={filteredRecords}
        columns={props.columns}
        placeholder={`No ${props.potName}s...`}
        rowClicked={onRowClicked}
        rowFormatter={props.rowFormatter}
      />
    </div>
  )
}
