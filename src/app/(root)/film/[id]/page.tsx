'use server'

import React from 'react'
import AddFilm from '@/components/film/AddFilm'
import { getDirectorList } from '@/lib/actions/director.action'
import { getGenreList } from '@/lib/actions/genre.action'
import { getPlatformList } from '@/lib/actions/platform.action'
import { getFilm } from '@/lib/actions/film.action'
import { Director, Genre, Platform } from '@/server/db/schema'

export default async function Film(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const film = await getFilm(params.id)
  const directorList: Director[] = await getDirectorList()
  const genreList: Genre[] = await getGenreList()
  const platformList: Platform[] = await getPlatformList()
  return (
    <AddFilm
      film={film}
      directorList={directorList}
      genreList={genreList}
      platformList={platformList}
    />
  )
}
