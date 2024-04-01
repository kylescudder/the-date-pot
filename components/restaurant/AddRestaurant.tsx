'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import { usePathname, useRouter } from 'next/navigation'
import { IRestaurant } from '@/lib/models/restaurant'
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
import { Button, MultiSelect, TextInput } from '@mantine/core'
import Map from '../shared/Map'
import { ICuisine } from '@/lib/models/cuisine'
import { option } from '@/lib/models/select-options'
import { IWhen } from '@/lib/models/when'
import NoteCard from './NoteCard'
import FullScreenModal from '../shared/FullScreenModal'
import AddRestaurantNote from './AddRestaurantNote'
import ReloadMapPlaceholder from '../shared/ReloadMapPlaceholder'

export default function AddRestaurant(props: {
  restaurant: IRestaurant
  longLat: number[]
  cuisineList: ICuisine[]
  whenList: IWhen[]
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

  const cuisineOptions: option[] = props.cuisineList.map((user: ICuisine) => ({
    value: user.cuisine,
    label: user.cuisine
  }))
  const whenOptions: option[] = props.whenList.map((user: IWhen) => ({
    value: user.when,
    label: user.when
  }))

  const restaurantNote: string = ''

  interface formRestaurant {
    _id: string
    restaurantName: string
    address: string
    archive: boolean
    userGroupID: string
    cuisines: string[]
    whens: string[]
    notes: string[]
  }

  const form = useForm({
    initialValues: {
      _id: props.restaurant._id ? props.restaurant._id : '',
      restaurantName: props.restaurant.restaurantName
        ? props.restaurant.restaurantName
        : '',
      address: props.restaurant.address ? props.restaurant.address : '',
      archive: props.restaurant.archive ? props.restaurant.archive : false,
      userGroupID: props.restaurant.userGroupID
        ? props.restaurant.userGroupID
        : '',
      cuisines: props.restaurant.cuisines ? props.restaurant.cuisines : [''],
      whens: props.restaurant.whens ? props.restaurant.whens : [''],
      notes: props.restaurant.notes ? props.restaurant.notes : ['']
    }
  })

  const onSubmit = async (values: formRestaurant) => {
    const payload: IRestaurant = {
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
      router.push(`/restaurant/${restaurant._id}`)
    }
  }

  const handleArchive = async () => {
    await archiveRestaurant(props.restaurant._id)
    archiveToast(props.restaurant.restaurantName)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/restaurants`
    }, 1000)
  }

  const pullNote = async (note: string) => {
    const updatedNotes = notes.filter((item) => item !== note)
    setNotes(updatedNotes)
    await deleteRestaurantNote(note, props.restaurant._id)
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
      <div className="flex justify-between items-center">
        <BackButton
          record={props.restaurant}
          changesMade={changesMade}
          page="restaurants"
        />
        <Button
          className={`bg-danger text-light-1 ${
            props.restaurant._id === '' ? 'hidden' : ''
          }`}
          onClick={handleArchive}
          aria-label="archive"
        >
          <IconTrash className="text-light-1" />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.restaurant._id === '' ? 'px-6' : ''
        }`}
      >
        <TextInput
          label="Name"
          radius="md"
          placeholder="The good yum yum place"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps('restaurantName')}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label="Cuisine"
          placeholder="Pick some"
          data={cuisineOptions}
          {...form.getInputProps('cuisines')}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label="When"
          placeholder="Pick some"
          data={whenOptions}
          {...form.getInputProps('whens')}
        />
        <TextInput
          label="Address"
          radius="md"
          placeholder="Where it at?"
          className="text-dark-2 dark:text-light-2"
          size="md"
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
        <div className="flex justify-between">
          <div className="flex-grow pr-2">
            <p className="text-dark-1 dark:text-light-1 pt-3 inline-block text-base font-black">
              Notes
            </p>
          </div>
          <div className="mt-auto">
            <Button
              radius="md"
              className="bg-success text-light-1 r-0"
              onClick={() => setOpen(true)}
              aria-label="add"
              size="md"
            >
              <IconCirclePlus className="text-light-1" />
            </Button>
          </div>
        </div>
        {notes.map((note: string) => {
          return <NoteCard key={note} note={note} func={pullNote} />
        })}
        <Button
          radius="md"
          className="bg-primary-500 hover:bg-primary-hover text-light-1"
          type="submit"
        >
          {props.restaurant._id === '' ? 'Add' : 'Update'} Restaurant
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
        title="Add Note"
      />
    </div>
  )
}
