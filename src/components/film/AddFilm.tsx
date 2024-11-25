'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { archiveFilm, updateFilm } from '@/lib/actions/film.action'
import { archiveToast, successToast } from '@/lib/actions/toast.actions'
import { IconCalendar, IconTrash } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import { option } from '@/lib/models/select-options'
import { addDirector } from '@/lib/actions/director.action'
import { addGenre } from '@/lib/actions/genre.action'
import { addPlatform } from '@/lib/actions/platform.action'
import { Films } from '@/lib/models/films'
import { Director, Genre, Platform } from '@/server/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldValues, useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar } from '../ui/calendar'
import { Checkbox } from '../ui/checkbox'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from '../ui/multi-select'

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
    name: string
    releaseDate: Date
    runTime: number
    userGroupId: string
    watched: boolean
    directors: string[]
    genres: string[]
    platforms: string[]
  }

  const form = useForm({
    defaultValues: {
      id: props.film.id ? props.film.id : '',
      addedById: props.film.addedById ? props.film.addedById : '',
      addedDate: props.film.addedDate ? props.film.addedDate : new Date(),
      archive: props.film.archive ? props.film.archive : false,
      name: props.film.name ? props.film.name : '',
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
      name: values.name,
      releaseDate: values.releaseDate,
      runTime: values.runTime,
      watched: values.watched,
      directors: values.directors,
      genres: values.genres,
      platforms: values.platforms
    }

    const film = await updateFilm(payload)
    if (pathname.includes('/film/')) {
      successToast(film.name)
      setChangesMade(true)
    } else {
      router.push(`/film/${film.id}`)
    }
  }

  const handleArchive = async () => {
    await archiveFilm(props.film.id)
    archiveToast(props.film.name)
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
          className={`${props.film.id === '' ? 'hidden' : ''}`}
          onClick={handleArchive}
          aria-label='archive'
          variant={'destructive'}
        >
          <IconTrash className='text-white' />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col justify-start gap-4 pt-4 ${
            props.film.id === '' ? 'p-4' : ''
          }`}
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='name'>Name</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      id='name'
                      className='text-base'
                      placeholder='Which cinematic masterpiece is it today?'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='releaseDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Release Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <IconCalendar className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='runTime'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='name'>Run time</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      id='runTime'
                      type='number'
                      className='text-base'
                      placeholder='Is it over 90 minutes?'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='watched'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Watched</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='directors'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Directors</FormLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  list={directors}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder='Pick some...?' />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {directors.map((director) => (
                        <MultiSelectorItem
                          key={director.value}
                          value={director.value}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>{director.label}</span>
                          </div>
                        </MultiSelectorItem>
                      ))}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='genres'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genres</FormLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  list={genres}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder='Pick some...?' />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {genres.map((genre) => (
                        <MultiSelectorItem
                          key={genre.value}
                          value={genre.value}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>{genre.label}</span>
                          </div>
                        </MultiSelectorItem>
                      ))}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='platforms'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platforms</FormLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  list={platforms}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder='Pick some...?' />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {platforms.map((platform) => (
                        <MultiSelectorItem
                          key={platform.value}
                          value={platform.value}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>{platform.label}</span>
                          </div>
                        </MultiSelectorItem>
                      ))}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </FormItem>
            )}
          />
          <Button type='submit'>
            {props.film.id === '' ? 'Add' : 'Update'} Film
          </Button>
        </form>
      </Form>
    </div>
  )
}
