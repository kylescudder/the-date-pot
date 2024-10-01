'use client'

import React, { useEffect, useState } from 'react'
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
import { MultiSelect } from '@mantine/core'
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
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { FieldValues, useForm } from 'react-hook-form'

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
    name: string
    address: string
    archive: boolean
    userGroupId: string
    cuisines: string[]
    whens: string[]
    notes: string[]
  }

  const form = useForm({
    defaultValues: {
      id: props.restaurant.id ? props.restaurant.id : '',
      name: props.restaurant.name ? props.restaurant.name : '',
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
      name: values.name,
      address: values.address,
      cuisines: values.cuisines,
      whens: values.whens,
      notes: values.notes
    }

    const restaurant = await updateRestaurant(payload)
    notes.forEach((element) => {})
    if (pathname.includes('/restaurant/')) {
      successToast(restaurant.name)
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
    archiveToast(props.restaurant.name)
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

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.restaurant}
          changesMade={changesMade}
          page='restaurants'
        />
        <Button
          className={`${props.restaurant.id === '' ? 'hidden' : ''}`}
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
            props.restaurant.id === '' ? 'px-6' : ''
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
                      placeholder='The good yum yum place'
                      id='name'
                      className='text-base'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='address'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='address'>Address</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      placeholder='Where it @?'
                      id='address'
                      className='text-base'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cuisines'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='cuisines'>Cuisines</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
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
                      transitionProps={{
                        transition: 'pop-bottom-left',
                        duration: 200
                      }}
                      placeholder='Pick some'
                      data={cuisines}
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='whens'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='whens'>When</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
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
                      transitionProps={{
                        transition: 'pop-bottom-left',
                        duration: 200
                      }}
                      placeholder='Pick some'
                      data={whens}
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          {props.longLat[0] !== undefined &&
            props.longLat[1] !== undefined &&
            props.longLat[0] !== 0 &&
            props.longLat[1] !== 0 && (
              <Map longLat={props.longLat} title={props.restaurant.name} />
            )}
          {address !== null &&
            address !== '' &&
            props.longLat[0] === undefined &&
            props.longLat[1] === undefined && <ReloadMapPlaceholder />}
          <div className='flex justify-between'>
            <div className='flex-grow pr-2'>
              <p className='inline-block pt-3 text-base font-black'>Notes</p>
            </div>
            <FullScreenModal
              button={
                <Button className='r-0 bg-success' aria-label='add'>
                  <IconCirclePlus />
                </Button>
              }
              form={
                <AddRestaurantNote
                  restaurant={props.restaurant}
                  restaurantNote={restaurantNote}
                  addNote={pullAddNote}
                />
              }
              title='Add Note'
            />
          </div>
          {notes.map((note: string) => {
            return <NoteCard key={note} note={note} func={pullNote} />
          })}
          <Button type='submit'>
            {props.restaurant.id === '' ? 'Add' : 'Update'} Restaurant
          </Button>
        </form>
      </Form>
    </div>
  )
}
