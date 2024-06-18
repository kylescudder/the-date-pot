'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import { usePathname, useRouter } from 'next/navigation'
import {
  archiveRestaurant,
  deleteRestaurantNote,
  updateRestaurant
} from '@/lib/actions/restaurant.action'
import {
  archiveToast,
  deleteToast,
  successToast
} from '@/lib/actions/toast.actions'
import { IconTrash, IconCirclePlus } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import { MultiSelect, TextInput } from '@mantine/core'
import Map from '../shared/Map'
import { option } from '@/lib/models/select-options'
import NoteCard from './NoteCard'
import FullScreenModal from '../shared/FullScreenModal'
import AddRestaurantNote from './AddRestaurantNote'
import ReloadMapPlaceholder from '../shared/ReloadMapPlaceholder'
import { addCuisine } from '@/lib/actions/cuisine.action'
import { addWhen } from '@/lib/actions/when.action'
import { Cuisine, When } from '@/server/db/schema'
import { Restaurants } from '@/lib/models/restaurants'
import { Button } from '@/components/ui/button'

export default function AddRestaurant(props: {
  restaurant: Restaurants
  longLat: number[]
  cuisineList: Cuisine[]
  whenList: When[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [notes, setNotes] = useState(props.restaurant.notes || [])
  const [changesMade, setChangesMade] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [address, setAddress] = useState<string>(props.restaurant.address)

  useEffect(() => {
    setChangesMade(true)
  }, [notes])

  useEffect(() => {
    console.log(address)
  }, [address])

  const cuisineOptions: option[] = props.cuisineList.map(
    (cuisine: Cuisine) => ({
      value: cuisine.id,
      label: cuisine.cuisine
    })
  )
  const [cuisines, setCuisines] = useState<option[]>(cuisineOptions)
  const whenOptions: option[] = props.whenList.map((when: When) => ({
    value: when.id,
    label: when.when
  }))
  const [whens, setWhens] = useState<option[]>(whenOptions)

  const restaurantNote: string = ''

  interface formRestaurant {
    id: string
    restaurantName: string
    address: string
    archive: boolean
    userGroupId: string
    cuisines: string[]
    whens: string[]
    notes: string[]
  }

  const form = useForm({
    initialValues: {
      id: props.restaurant.id ? props.restaurant.id : '',
      restaurantName: props.restaurant.restaurantName
        ? props.restaurant.restaurantName
        : '',
      address: props.restaurant.address ? props.restaurant.address : '',
      archive: props.restaurant.archive ? props.restaurant.archive : false,
      userGroupId: props.restaurant.userGroupId
        ? props.restaurant.userGroupId
        : '',
      cuisines: props.restaurant.cuisines ? props.restaurant.cuisines : [''],
      whens: props.restaurant.whens ? props.restaurant.whens : [''],
      notes: props.restaurant.notes ? props.restaurant.notes : ['']
    }
  })

  const onSubmit = async (values: formRestaurant) => {
    const payload: Restaurants = {
      ...props.restaurant,
      restaurantName: values.restaurantName,
      address: values.address,
      cuisines: values.cuisines,
      whens: values.whens,
      notes: values.notes
    }

    const restaurant = await updateRestaurant(payload)
    if (pathname.includes('/restaurant/')) {
      successToast(restaurant.restaurantName)
      setChangesMade(true)

      if (payload.address !== '') {
        setAddress(payload.address)
      }
    } else {
      router.push(`/restaurant/${restaurant.id}`)
    }
  }

  const handleArchive = async () => {
    await archiveRestaurant(props.restaurant.id)
    archiveToast(props.restaurant.restaurantName)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/restaurants`
    }, 1000)
  }

  const pullNote = async (note: string) => {
    const updatedNotes = notes.filter((item) => item !== note)
    setNotes(updatedNotes)
    await deleteRestaurantNote(note, props.restaurant.id)
    deleteToast('Note')
  }

  const pullAddNote = async (note: string) => {
    const newNoteList = [...notes, note]
    setNotes(newNoteList)
  }

  const pullData = (data: boolean) => {
    setOpen(data)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.restaurant}
          changesMade={changesMade}
          page='restaurants'
        />
        <Button
          className={`bg-danger text-white ${
            props.restaurant.id === '' ? 'hidden' : ''
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
          props.restaurant.id === '' ? 'px-6' : ''
        }`}
      >
        <TextInput
          label='Name'
          radius='md'
          placeholder='The good yum yum place'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('restaurantName')}
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
            const cuisine: Cuisine = { id: '', cuisine: query }
            setCuisines((current) => [...current, item])
            addCuisine(cuisine)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='Cuisine'
          placeholder='Pick some'
          data={cuisines}
          {...form.getInputProps('cuisines')}
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
            const when: When = { id: '', when: query }
            setWhens((current) => [...current, item])
            addWhen(when)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='When'
          placeholder='Pick some'
          data={whens}
          {...form.getInputProps('whens')}
        />
        <TextInput
          label='Address'
          radius='md'
          placeholder='Where it at?'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('address')}
        />
        {props.longLat[0] !== undefined && props.longLat[1] !== undefined && (
          <Map
            longLat={props.longLat}
            title={props.restaurant.restaurantName}
          />
        )}
        {address !== undefined &&
          address !== '' &&
          props.longLat[0] === undefined &&
          props.longLat[1] === undefined && <ReloadMapPlaceholder />}
        <div className='flex justify-between'>
          <div className='flex-grow pr-2'>
            <p className='inline-block pt-3 text-base font-black text-zinc-900 dark:text-white'>
              Notes
            </p>
          </div>
          <div className='mt-auto'>
            <Button
              className='r-0 bg-success text-white'
              onClick={() => setOpen(true)}
              aria-label='add'
            >
              <IconCirclePlus className='text-white' />
            </Button>
          </div>
        </div>
        {notes.map((note: string) => {
          return <NoteCard key={note} note={note} func={pullNote} />
        })}
        <Button
          className='hover:bg-primary-hover bg-emerald-500 text-white'
          type='submit'
        >
          {props.restaurant.id === '' ? 'Add' : 'Update'} Restaurant
        </Button>
      </form>
      <FullScreenModal
        open={open}
        func={pullData}
        form={
          <AddRestaurantNote
            restaurant={props.restaurant}
            restaurantNote={restaurantNote}
            func={pullData}
            addNote={pullAddNote}
          />
        }
        title='Add Note'
      />
    </div>
  )
}
