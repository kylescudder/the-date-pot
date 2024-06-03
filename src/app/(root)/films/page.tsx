'use server'

import FilmList from '@/components/film/List'
import { getDirectorList } from '@/lib/actions/director.action'
import { getGenreList } from '@/lib/actions/genre.action'
import { getPlatformList } from '@/lib/actions/platform.action'
import { getFilmList } from '@/lib/actions/film.action'
import { getUserGroup, getUserInfo } from '@/lib/actions/user.actions'
import { IFilm } from '@/lib/models/film'
import { IUser } from '@/lib/models/user'
import { IUserGroup } from '@/lib/models/user-group'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { IDirector } from '@/lib/models/director'
import { IGenre } from '@/lib/models/genre'
import { IPlatform } from '@/lib/models/platform'

export default async function Films() {
  const user = await currentUser()
  if (!user) return null

  const userInfo: IUser = await getUserInfo(user.id)
  const userGroup: IUserGroup = await getUserGroup(userInfo._id)
  const films: IFilm[] = await getFilmList(userGroup._id)
  const directorList: IDirector[] = await getDirectorList()
  const genreList: IGenre[] = await getGenreList()
  const platformList: IPlatform[] = await getPlatformList()

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
