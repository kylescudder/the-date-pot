'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  archiveToast,
  deleteToast,
  successToast
} from '@/lib/actions/toast.actions'
import { IconTrash, IconCirclePlus, IconCircleMinus } from '@tabler/icons-react'
import {
  archiveCoffee,
  deleteCoffeeRating,
  updateCoffee,
  updateCoffeeRating
} from '@/lib/actions/coffee.action'
import { useForm } from '@mantine/form'
import { Button, Rating, TextInput } from '@mantine/core'
import BackButton from '../shared/BackButton'
import Map from '@/components/shared/Map'
import AddCoffeeRating from './AddCoffeeRating'
import FullScreenModal from '../shared/FullScreenModal'
import ReloadMapPlaceholder from '@/components/shared/ReloadMapPlaceholder'
import { Coffee, CoffeeRating, User } from '@/server/db/schema'
import { CoffeeRatings } from '@/lib/models/coffeeRatings'

export default function AddCoffee(props: {
  coffee: Coffee
  ratings: CoffeeRatings[]
  users: User[]
  longLat: number[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)
  const [coffeeRatings, setCoffeeRatings] = useState<CoffeeRatings[]>(
    props.ratings
  )
  const [address, setAddress] = useState<string>(props.coffee.address)

  const [open, setOpen] = useState<boolean>(false)

  interface formCoffee {
    id: string
    archive: boolean
    coffeeName: string
    addedById: string
    userGroupId: string
    avgExperience: number
    avgTaste: number
    avgRating: number
    address: string
  }

  const coffeeRating: CoffeeRatings = {
    id: '',
    coffeeId: '',
    experience: 0,
    taste: 0,
    userId: '',
    username: ''
  }

  const form = useForm({
    initialValues: {
      id: props.coffee.id ? props.coffee.id : '',
      archive: props.coffee.archive ? props.coffee.archive : false,
      coffeeName: props.coffee.coffeeName ? props.coffee.coffeeName : '',
      addedById: props.coffee.addedById ? props.coffee.addedById : '',
      userGroupId: props.coffee.userGroupId ? props.coffee.userGroupId : '',
      avgExperience: 0,
      avgTaste: 0,
      avgRating: 0,
      address: props.coffee.address ? props.coffee.address : ''
    }
  })

  const handleRemoveRecord = async (id: string, index: number) => {
    const updatedArray = await coffeeRatings.filter((item, i) => item.id !== id)
    setCoffeeRatings(updatedArray)
    if (id !== '') {
      await deleteCoffeeRating(id)
    }
    const rating = await coffeeRatings.filter((item) => item.id === id)
    deleteToast(`${rating[0]!.username}'s rating`)
    setChangesMade(true)
  }

  const onSubmit = async (values: formCoffee) => {
    const payload: Coffee = {
      ...props.coffee,
      coffeeName: values.coffeeName,
      address: values.address
    }

    const coffee = await updateCoffee(payload)

    coffeeRatings.map(async (rating: CoffeeRatings) => {
      const updatedRating = {
        ...rating,
        coffeeId: coffee.id
      }

      await updateCoffeeRating(updatedRating)
    })
    if (pathname.includes('/coffee/')) {
      successToast(coffee.coffeeName)
      setChangesMade(true)

      if (payload.address !== '') {
        setAddress(payload.address)
      }
    } else {
      router.push(`/coffee/${coffee.id}`)
    }
  }

  const pullData = (data: boolean) => {
    setOpen(data)
  }

  const pullRating = async (data: CoffeeRatings) => {
    const newRatingList = [...coffeeRatings, data]
    setCoffeeRatings(newRatingList)
  }

  const handleArchive = async () => {
    await archiveCoffee(props.coffee.id)
    archiveToast(props.coffee.coffeeName)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/coffees`
    }, 1000)
  }

  const handleExperienceChange = (experience: number, i: number) => {
    // Make a copy of the current coffeeRatings array
    const updatedCoffeeRatings = [...coffeeRatings]

    // Update the experience property of the rating at index i
    updatedCoffeeRatings[i]!.experience = experience

    // Set the updated coffeeRatings array back to state
    setCoffeeRatings(updatedCoffeeRatings)
  }

  const handleTasteChange = (taste: number, i: number) => {
    // Make a copy of the current coffeeRatings array
    const updatedCoffeeRatings = [...coffeeRatings]

    // Update the taste property of the rating at index i
    updatedCoffeeRatings[i]!.taste = taste

    // Set the updated coffeeRatings array back to state
    setCoffeeRatings(updatedCoffeeRatings)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.coffee}
          changesMade={changesMade}
          page='coffees'
        />
        <Button
          radius='md'
          className={`bg-danger text-light-1 ${
            props.coffee.id === '' ? 'hidden' : ''
          }`}
          onClick={handleArchive}
          aria-label='archive'
        >
          <IconTrash className='text-light-1' />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.coffee.id === '' ? 'px-6' : ''
        }`}
      >
        <TextInput
          label='Name'
          radius='md'
          placeholder='The best coffee shop in the world'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('coffeeName')}
        />
        <div className='flex justify-between'>
          <div className='flex-grow pr-2'>
            <p className='inline-block pt-3 text-base font-black text-dark-1 dark:text-light-1'>
              Ratings
            </p>
          </div>
          <div className='mt-auto'>
            <Button
              radius='md'
              className='r-0 bg-success text-light-1'
              onClick={() => setOpen(true)}
              aria-label='add'
              size='md'
            >
              <IconCirclePlus className='text-light-1' />
            </Button>
          </div>
        </div>
        {coffeeRatings.length !== 0 ? (
          coffeeRatings.map((rating: CoffeeRatings, i: number) => {
            return (
              <div
                key={rating.userId}
                className='w-full overflow-hidden rounded-md bg-light-3 shadow-lg dark:bg-dark-3'
              >
                <div className='px-6 py-4'>
                  <div className='mb-2 contents w-1/2 text-xl font-black text-dark-1 dark:text-light-1'>
                    {rating.username}
                  </div>
                  <div className='contents w-1/2'>
                    <IconCircleMinus
                      onClick={() => handleRemoveRecord(rating.id, i)}
                      className='float-right text-danger'
                    />
                  </div>
                  <div className='flex items-center pt-2 text-base'>
                    <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
                      Taste
                    </span>
                    <Rating
                      name='taste'
                      value={rating.taste}
                      onChange={(value) => handleTasteChange(value, i)}
                      fractions={2}
                      size='xl'
                    />
                  </div>
                  <div className='flex items-center pt-5 text-base'>
                    <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
                      Experience
                    </span>
                    <Rating
                      name='experience'
                      value={rating.experience}
                      onChange={(value) => handleExperienceChange(value, i)}
                      fractions={2}
                      size='xl'
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className='w-full overflow-hidden rounded-md bg-light-4 shadow-lg dark:bg-dark-4'>
            <div className='px-6 py-4'>
              <div className='mb-2 contents w-1/2 text-xl font-bold text-dark-1 dark:text-light-1'>
                Please add a rating!
              </div>
            </div>
          </div>
        )}
        <TextInput
          label='Address'
          radius='md'
          placeholder='Where it at?'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('address')}
        />
        {props.longLat[0] !== undefined && props.longLat[1] !== undefined && (
          <Map longLat={props.longLat} title={props.coffee.coffeeName} />
        )}
        {address !== undefined &&
          address !== '' &&
          props.longLat[0] === undefined &&
          props.longLat[1] === undefined && <ReloadMapPlaceholder />}
        <Button
          radius='md'
          className='bg-primary-500 text-light-1 hover:bg-primary-hover'
          type='submit'
        >
          {props.coffee.id === '' ? 'Add' : 'Update'} Coffee
        </Button>
      </form>
      <FullScreenModal
        open={open}
        func={pullData}
        form={
          <AddCoffeeRating
            coffee={props.coffee}
            coffeeRating={coffeeRating}
            func={pullData}
            addRating={pullRating}
            users={props.users}
          />
        }
        title='Add Rating'
      />
    </div>
  )
}
