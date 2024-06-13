'use client'

import React from 'react'
import AddFilm from './AddFilm'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { Director, Genre, Platform } from '@/server/db/schema'
import { Films } from '@/lib/models/films'

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
    filmName: '',
    releaseDate: new Date(),
    runTime: 0,
    userGroupId: '',
    watched: false,
    directors: [],
    genres: [],
    platforms: []
  }

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.films}
      potName='Film'
      rowFormatter={null}
      columns={[
        {
          headerName: 'Name',
          field: 'filmName',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Run time',
          field: 'runTime',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Directors',
          field: 'directors',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Genre',
          field: 'genres',
          resizable: false,
          minWidth: 200
        },
        {
          headerName: 'Platforms',
          field: 'platforms',
          resizable: false,
          minWidth: 200
        }
      ]}
      filterColumns={['filmName', 'directors']}
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
