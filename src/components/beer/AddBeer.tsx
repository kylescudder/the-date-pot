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
  archiveBeer,
  deleteBeerRating,
  updateBeer,
  updateBeerRating
} from '@/lib/actions/beer.action'
import { option } from '@/lib/models/select-options'
import { useForm } from '@mantine/form'
import {
  Button,
  MultiSelect,
  NumberInput,
  Rating,
  TextInput
} from '@mantine/core'
import BackButton from '../shared/BackButton'
import AddBeerRating from './AddBeerRating'
import FullScreenModal from '../shared/FullScreenModal'
import { addBrewery } from '@/lib/actions/brewer.action'
import { addBeerType } from '@/lib/actions/beer-type'
import { Beer, BeerRating, BeerType, Brewery, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'
import { Beers } from '@/lib/models/beers'

export default function AddBeer(props: {
  beer: Beers
  ratings: BeerRatings[]
  users: User[]
  breweryList: Brewery[]
  beerTypeList: BeerType[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)
  const [beerRatings, setBeerRatings] = useState<BeerRatings[]>(props.ratings)
  const [open, setOpen] = useState<boolean>(false)

  const breweryOptions: option[] = props.breweryList.map(
    (brewery: Brewery) => ({
      value: brewery.id,
      label: brewery.breweryName
    })
  )
  const beerTypeOptions: option[] = props.beerTypeList.map(
    (beerType: BeerType) => ({
      value: beerType.id,
      label: beerType.beerType
    })
  )
  const [breweries, setBreweries] = useState<option[]>(breweryOptions)
  const [beerTypes, setBeerTypes] = useState<option[]>(beerTypeOptions)

  interface formBeer {
    id: string
    archive: boolean
    beerName: string
    abv: number
    breweries: string[]
    beerTypes: string[]
    addedById: string
    userGroupId: string
    avgWankyness: number
    avgTaste: number
    avgRating: number
  }

  const beerRating: BeerRatings = {
    id: '',
    beerId: '',
    wankyness: 0,
    taste: 0,
    userId: '',
    username: ''
  }

  const form = useForm({
    initialValues: {
      id: props.beer.id ? props.beer.id : '',
      archive: props.beer.archive ? props.beer.archive : false,
      beerName: props.beer.beerName ? props.beer.beerName : '',
      abv: props.beer.abv ? props.beer.abv : 0,
      breweries: props.beer.breweries ? props.beer.breweries : [],
      beerTypes: props.beer.beerTypes ? props.beer.beerTypes : [],
      addedById: props.beer.addedById ? props.beer.addedById : '',
      userGroupId: props.beer.userGroupId ? props.beer.userGroupId : '',
      avgWankyness: 0,
      avgTaste: 0,
      avgRating: 0
    }
  })

  const handleRemoveRecord = async (id: string, index: number) => {
    const updatedArray = await beerRatings.filter((item, i) => item.id !== id)
    setBeerRatings(updatedArray)
    if (id !== '') {
      await deleteBeerRating(id)
    }
    const rating = await beerRatings.filter((item) => item.id === id)
    deleteToast(`${rating[0]!.username}'s rating`)
  }

  const onSubmit = async (values: formBeer) => {
    const payload: Beers = {
      ...props.beer,
      beerName: values.beerName,
      abv: values.abv,
      breweries: values.breweries,
      beerTypes: values.beerTypes
    }

    const beer = await updateBeer(payload)

    beerRatings.map(async (rating: BeerRatings) => {
      const updatedRating = {
        ...rating,
        beerId: beer.id
      }

      await updateBeerRating(updatedRating)
    })
    if (pathname.includes('/beer/')) {
      successToast(beer.beerName)
      setChangesMade(true)
    } else {
      router.push(`/beer/${beer.id}`)
    }
  }

  const pullData = (data: boolean) => {
    setOpen(data)
  }

  const pullRating = async (data: BeerRatings) => {
    const newRatingList = [...beerRatings, data]
    setBeerRatings(newRatingList)
  }

  const handleArchive = async () => {
    await archiveBeer(props.beer.id)
    archiveToast(props.beer.beerName)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/beers`
    }, 1000)
  }

  const handleWankynessChange = (wankyness: number, i: number) => {
    // Make a copy of the current beerRatings array
    const updatedBeerRatings = [...beerRatings]

    // Update the wankyness property of the rating at index i
    updatedBeerRatings[i]!.wankyness = wankyness

    // Set the updated beerRatings array back to state
    setBeerRatings(updatedBeerRatings)
  }

  const handleTasteChange = (taste: number, i: number) => {
    // Make a copy of the current beerRatings array
    const updatedBeerRatings = [...beerRatings]

    // Update the taste property of the rating at index i
    updatedBeerRatings[i]!.taste = taste

    // Set the updated beerRatings array back to state
    setBeerRatings(updatedBeerRatings)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.beer}
          changesMade={changesMade}
          page='beers'
        />
        <Button
          radius='md'
          className={`bg-danger text-white ${
            props.beer.id === '' ? 'hidden' : ''
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
          props.beer.id === '' ? 'px-6' : ''
        }`}
      >
        <TextInput
          label='Name'
          radius='md'
          placeholder='The best beer in the world'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('beerName')}
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
            const brewery: Brewery = { id: '', breweryName: query }
            setBreweries((current) => [...current, item])
            addBrewery(brewery)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='Breweries'
          placeholder='Pick some'
          data={breweries}
          {...form.getInputProps('breweries')}
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
            const beerType: BeerType = { id: '', beerType: query }
            setBeerTypes((current) => [...current, item])
            addBeerType(beerType)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label='Type'
          placeholder='Pick some'
          data={beerTypes}
          {...form.getInputProps('beerTypes')}
        />
        <NumberInput
          label='ABV'
          radius='md'
          precision={1}
          step={0.1}
          placeholder='Session or strong?'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('abv')}
        />
        <div className='flex justify-between'>
          <div className='flex-grow pr-2'>
            <p className='inline-block pt-3 text-base font-black text-zinc-900 dark:text-white'>
              Ratings
            </p>
          </div>
          <div className='mt-auto'>
            <Button
              radius='md'
              className='r-0 bg-success text-white'
              onClick={() => setOpen(true)}
              aria-label='add'
              size='md'
            >
              <IconCirclePlus className='text-white' />
            </Button>
          </div>
        </div>
        {beerRatings.length !== 0 ? (
          beerRatings.map((rating: BeerRatings, i: number) => {
            return (
              <div
                key={rating.userId}
                className='dark:bg-dark-3 w-full overflow-hidden rounded-md text-zinc-600 shadow-lg'
              >
                <div className='px-6 py-4'>
                  <div className='mb-2 contents w-1/2 text-xl font-black text-zinc-900 dark:text-white'>
                    {rating.username}
                  </div>
                  <div className='contents w-1/2'>
                    <IconCircleMinus
                      onClick={() => handleRemoveRecord(rating.id, i)}
                      className='text-danger float-right'
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
                      Wankyness
                    </span>
                    <Rating
                      name='wankyness'
                      value={rating.wankyness}
                      onChange={(value) => handleWankynessChange(value, i)}
                      fractions={2}
                      size='xl'
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className='w-full overflow-hidden rounded-md text-zinc-700 shadow-lg dark:text-black'>
            <div className='px-6 py-4'>
              <div className='mb-2 contents w-1/2 text-xl font-bold text-zinc-900 dark:text-white'>
                Please add a rating!
              </div>
            </div>
          </div>
        )}
        <Button
          radius='md'
          className='hover:bg-primary-hover bg-emerald-500 text-white'
          type='submit'
        >
          {props.beer.id === '' ? 'Add' : 'Update'} Beer
        </Button>
      </form>
      <FullScreenModal
        open={open}
        func={pullData}
        form={
          <AddBeerRating
            beer={props.beer}
            beerRating={beerRating}
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
