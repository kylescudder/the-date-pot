'use client'

import { IFilm } from '@/lib/models/film'
import React from 'react'
import AddFilm from './AddFilm'
import Loading from '../shared/Loading'
import List from '../shared/List'
import { IDirector } from '@/lib/models/director'
import { IPlatform } from '@/lib/models/platform'
import { IGenre } from '@/lib/models/genre'

export default function FilmList(props: {
  films: IFilm[]
  directorList: IDirector[]
  genreList: IGenre[]
  platformList: IPlatform[]
}) {
  const [loading, setLoading] = React.useState(false)

  const newFilm: IFilm = {
    _id: '',
    addedByID: '',
    addedDate: new Date(),
    archive: false,
    filmName: '',
    releaseDate: new Date(),
    runTime: 0,
    userGroupID: '',
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
      potName="Film"
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
