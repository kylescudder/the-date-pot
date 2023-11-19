"use server"

import AddFilm from "@/components/film/AddFilm";
import { getDirectorList } from '@/lib/actions/director.action';
import { getGenreList } from '@/lib/actions/genre.action';
import { getPlatformList } from '@/lib/actions/platform.action';
import { getFilm } from "@/lib/actions/film.action";
import { IFilm } from "@/lib/models/film";
import { IDirector } from '@/lib/models/director';
import { IGenre } from '@/lib/models/genre';
import { IPlatform } from '@/lib/models/platform';

import React from 'react'

export default async function Film({ params }: { params: { id: string } }) {
  const film: IFilm = await getFilm(params.id);
  const directorList: IDirector[] = await getDirectorList();
  const genreList: IGenre[] = await getGenreList();
  const platformList: IPlatform[] = await getPlatformList();
  return (
    <AddFilm film={film}
      directorList={directorList}
      genreList={genreList}
      platformList={platformList} />
  )
}
