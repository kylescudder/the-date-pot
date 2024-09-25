'use client'

import React from 'react'
import AddFilm from './AddFilm'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Director, Genre, Platform } from '@/server/db/schema'
import { Films } from '@/lib/models/films'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../ui/data-table-header'

export default function FilmList(props: {
  films: Films[]
  directorList: Director[]
  genreList: Genre[]
  platformList: Platform[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newFilm: Films = {
    id: '',
    addedById: '',
    addedDate: new Date(),
    archive: false,
    name: '',
    releaseDate: new Date(),
    runTime: 0,
    userGroupId: '',
    watched: false,
    directors: [],
    genres: [],
    platforms: []
  }

  const columns: ColumnDef<Films>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      )
    },
    {
      accessorKey: 'runTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Run time' />
      )
    },
    {
      accessorKey: 'directors',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Directors' />
      )
    },
    {
      accessorKey: 'genres',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Genres' />
      )
    },
    {
      accessorKey: 'platforms',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Platforms' />
      )
    }
  ]

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.films}
      potName='Film'
      rowFormatter={null}
      columns={columns}
      filterColumns={['name', 'directors']}
      addRecordComp={
        <AddFilm
          film={newFilm}
          directorList={props.directorList}
          genreList={props.genreList}
          platformList={props.platformList}
        />
      }
    />
  )
}
