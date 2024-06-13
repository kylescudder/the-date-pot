'use server'

import React from 'react'
import FilmList from '@/components/film/List'
import { getDirectorList } from '@/lib/actions/director.action'
import { getGenreList } from '@/lib/actions/genre.action'
import { getPlatformList } from '@/lib/actions/platform.action'
import { getFilmList } from '@/lib/actions/film.action'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs/server'
import { Director, Film, Genre, Platform } from '@/server/db/schema'
import { Films as FilmType } from '@/lib/models/films'

export default async function Films() {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await getUserInfo(user.id)
  const userGroup = await getUserGroup(userInfo!.id)
  const films: FilmType[] = await getFilmList(userGroup.id)
  const directorList: Director[] = await getDirectorList()
  const genreList: Genre[] = await getGenreList()
  const platformList: Platform[] = await getPlatformList()

  return (
    <div className='listPage'>
      <FilmList
        films={films}
        directorList={directorList}
        genreList={genreList}
        platformList={platformList}
      />
    </div>
  )
}
