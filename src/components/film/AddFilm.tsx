'use client'

import React, { useState } from 'react'
import { useForm } from '@mantine/form'
import { usePathname, useRouter } from 'next/navigation'
import { archiveFilm, updateFilm } from '@/lib/actions/film.action'
import { archiveToast, successToast } from '@/lib/actions/toast.actions'
import { IconTrash } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import { Checkbox, MultiSelect, NumberInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { option } from '@/lib/models/select-options'
import { addDirector } from '@/lib/actions/director.action'
import { addGenre } from '@/lib/actions/genre.action'
import { addPlatform } from '@/lib/actions/platform.action'
import { Films } from '@/lib/models/films'
import { Director, Genre, Platform } from '@/server/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddFilm(props: {
  film: Films
  directorList: Director[]
  genreList: Genre[]
  platformList: Platform[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const directorOptions: option[] = props.directorList.map(
    (director: Director) => ({
      value: director.id,
      label: director.directorName
    })
  )
  const [directors, setDirectors] = useState<option[]>(directorOptions)
  const genreOptions: option[] = props.genreList.map((genre: Genre) => ({
    value: genre.id,
    label: genre.genreText
  }))
  const [genres, setGenres] = useState<option[]>(genreOptions)
  const platformOptions: option[] = props.platformList.map(
    (platform: Platform) => ({
      value: platform.id,
      label: platform.platformName
    })
  )
  const [platforms, setPlatforms] = useState<option[]>(platformOptions)

  const filmNote: string = ''

  interface formFilm {
    id: string
    addedById: string
    addedDate: Date
    archive: boolean
    filmName: string
    releaseDate: Date
    runTime: number
    userGroupId: string
    watched: boolean
    directors: string[]
    genres: string[]
    platforms: string[]
  }

  const form = useForm({
    initialValues: {
      id: props.film.id ? props.film.id : '',
      addedById: props.film.addedById ? props.film.addedById : '',
      addedDate: props.film.addedDate ? props.film.addedDate : new Date(),
      archive: props.film.archive ? props.film.archive : false,
      filmName: props.film.filmName ? props.film.filmName : '',
      releaseDate: props.film.releaseDate ? props.film.releaseDate : new Date(),
      runTime: props.film.runTime ? props.film.runTime : 0,
      userGroupId: props.film.userGroupId ? props.film.userGroupId : '',
      watched: props.film.watched ? props.film.watched : false,
      directors: props.film.directors ? props.film.directors : [''],
      genres: props.film.genres ? props.film.genres : [''],
      platforms: props.film.platforms ? props.film.platforms : ['']
    }
  })

  const onSubmit = async (values: formFilm) => {
    const payload: Films = {
      ...props.film,
      filmName: values.filmName,
      releaseDate: values.releaseDate,
      runTime: values.runTime,
      watched: values.watched,
      directors: values.directors,
      genres: values.genres,
      platforms: values.platforms
    }

    const film = await updateFilm(payload)
    if (pathname.includes('/film/')) {
      successToast(film.filmName)
      setChangesMade(true)
    } else {
      router.push(`/film/${film.id}`)
    }
  }

  const handleArchive = async () => {
    await archiveFilm(props.film.id)
    archiveToast(props.film.filmName)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/films`
    }, 1000)
  }

  const pullData = (data: boolean) => {
    setOpen(data)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.film}
          changesMade={changesMade}
          page='films'
        />
        <Button
          className={`bg-danger text-white ${
            props.film.id === '' ? 'hidden' : ''
          }`}
          onClick={handleArchive}
          aria-label='archive'
        >
          <IconTrash className='text-white' />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.film.id === '' ? 'px-6' : ''
        }`}
      >
        <Label htmlFor='filmName'>Name</Label>
        <Input
          placeholder='Which cinematic masterpiece is it today?'
          {...form.getInputProps('filmName')}
        />
        <DatePickerInput
          label='Release Date'
          radius='md'
          valueFormat='DD/MM/YYYY'
          size='md'
          {...form.getInputProps('releaseDate')}
        />
        <Label htmlFor='runTime'>Run time</Label>
        <Input
          type='number'
          step={1}
          placeholder='It is over 90 minutes?'
          {...form.getInputProps('abv')}
        />
        <Checkbox
          label='Watched'
          radius='md'
          size='md'
          {...form.getInputProps('watched')}
        />
        <MultiSelect
          multiple={true}
          radius='md'
          size='md'
          clearable
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query }
            const director: Director = { id: '', directorName: query }
            setDirectors((current) => [...current, item])
            addDirector(director)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='Directors'
          placeholder='Pick some'
          data={directors}
          {...form.getInputProps('directors')}
        />
        <MultiSelect
          multiple={true}
          radius='md'
          size='md'
          clearable
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query }
            const genre: Genre = { id: '', genreText: query }
            setGenres((current) => [...current, item])
            addGenre(genre)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='Genres'
          placeholder='Pick some'
          data={genres}
          {...form.getInputProps('genres')}
        />
        <MultiSelect
          multiple={true}
          radius='md'
          size='md'
          clearable
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query }
            const platform: Platform = { id: '', platformName: query }
            setPlatforms((current) => [...current, item])
            addPlatform(platform)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='Platforms'
          placeholder='Pick some'
          data={platforms}
          {...form.getInputProps('platforms')}
        />
        <Button
          className='hover:bg-primary-hover bg-emerald-500 text-white'
          type='submit'
        >
          {props.film.id === '' ? 'Add' : 'Update'} Film
        </Button>
      </form>
    </div>
  )
}
