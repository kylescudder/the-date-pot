'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  archiveToast,
  deleteToast,
  successToast
} from '@/lib/actions/toast.actions'
import { IconTrash, IconCircleMinus, IconCirclePlus } from '@tabler/icons-react'
import {
  archiveBeer,
  deleteBeerRating,
  updateBeer,
  updateBeerRating
} from '@/lib/actions/beer.action'
import { option } from '@/lib/models/select-options'
import BackButton from '../shared/BackButton'
import AddBeerRating from './AddBeerRating'
import FullScreenModal from '../shared/FullScreenModal'
import { addBrewery } from '@/lib/actions/brewer.action'
import { addBeerType } from '@/lib/actions/beer-type'
import { BeerType, Brewery, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'
import { Beers } from '@/lib/models/beers'
import { useForm, type FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from '@/components/ui/multi-select'
import { StarRating } from '../ui/star-rating'

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
    name: string
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
    defaultValues: {
      id: props.beer.id ? props.beer.id : '',
      archive: props.beer.archive ? props.beer.archive : false,
      name: props.beer.name ? props.beer.name : '',
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

  const handleRemoveRecord = async (rating: BeerRatings) => {
    if (rating !== null) {
      const updatedArray = beerRatings.filter((item) => item !== rating)
      setBeerRatings(updatedArray)
      if (rating.id !== '') await deleteBeerRating(rating)
      deleteToast(`${rating!.username}'s rating`)
      setChangesMade(true)
    }
  }

  const onSubmit = async (values: formBeer) => {
    const payload: Beers = {
      ...props.beer,
      name: values.name,
      abv: values.abv,
      breweries: breweries
        .filter((brewery) =>
          values.breweries.some(
            (valueBrewery) => valueBrewery === brewery.label
          )
        )
        .map((brewery) => brewery.value),
      beerTypes: beerTypes
        .filter((beerType) =>
          values.beerTypes.some(
            (valueBeerType) => valueBeerType === beerType.label
          )
        )
        .map((beerType) => beerType.value)
    }

    const beer = await updateBeer(payload)

    await Promise.all(
      beerRatings.map(async (rating: BeerRatings) => {
        const updatedRating = {
          ...rating,
          beerId: beer.id
        }

        await updateBeerRating(updatedRating)
      })
    )
    if (pathname.includes('/beer/')) {
      successToast(beer.name)
      setChangesMade(true)
    } else {
      router.push(`/beer/${beer.id}`)
    }
  }

  const pullRating = async (data: BeerRatings) => {
    const newRatingList = [...beerRatings, data]
    setBeerRatings(newRatingList)
    setOpen(false)
  }

  const handleArchive = async () => {
    await archiveBeer(props.beer.id)
    archiveToast(props.beer.name)
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
          className={`${props.beer.id === '' ? 'hidden' : ''}`}
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
            props.beer.id === '' ? 'p-4' : ''
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
                      placeholder='The best beer in the world'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='breweries'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breweries</FormLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  list={breweries}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder='Pick some' />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {breweries.map((brewery) => (
                        <MultiSelectorItem
                          key={brewery.value}
                          value={brewery.value}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>{brewery.label}</span>
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
            name='beerTypes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beer Types</FormLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  list={beerTypes}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder='Pick some' />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {beerTypes.map((beerType) => (
                        <MultiSelectorItem
                          key={beerType.value}
                          value={beerType.value}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>{beerType.label}</span>
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
            name='abv'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='abv'>ABV</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      id='abv'
                      type='number'
                      step={0.1}
                      className='text-base'
                      placeholder='The best beer in the world'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-between'>
            <div className='flex-grow pr-2'>
              <p className='inline-block pt-3 text-base font-black'>Ratings</p>
            </div>
            <FullScreenModal
              button={
                <Button aria-label='add'>
                  <IconCirclePlus />
                </Button>
              }
              form={
                <AddBeerRating
                  beer={props.beer}
                  beerRating={beerRating}
                  addRating={pullRating}
                  users={props.users}
                />
              }
              title='Add Rating'
              open={open}
              onOpenChange={setOpen}
            />
          </div>
          {beerRatings.length !== 0 ? (
            beerRatings.map((rating: BeerRatings, i: number) => {
              return (
                <div
                  key={rating.userId}
                  className='w-full overflow-hidden rounded-md shadow-lg'
                >
                  <div className='px-6 py-4'>
                    <div className='mb-2 contents w-1/2 text-xl font-black'>
                      {rating.username}
                    </div>
                    <div className='contents w-1/2'>
                      <IconCircleMinus
                        onClick={() => handleRemoveRecord(rating)}
                        className='float-right text-destructive'
                      />
                    </div>
                    <div className='flex items-center pt-2 text-base'>
                      <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
                        Taste
                      </span>
                      <StarRating
                        max={5}
                        increment={0.5}
                        name='taste'
                        value={rating.taste}
                        onChange={(value) => handleTasteChange(value, i)}
                      />
                    </div>
                    <div className='flex items-center pt-5 text-base'>
                      <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
                        Wankyness
                      </span>
                      <StarRating
                        max={5}
                        increment={0.5}
                        name='wankyness'
                        value={rating.wankyness}
                        onChange={(value) => handleWankynessChange(value, i)}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='w-full overflow-hidden rounded-md shadow-lg'>
              <div className='px-6 py-4'>
                <div className='mb-2 contents w-1/2 text-xl font-bold'>
                  Please add a rating!
                </div>
              </div>
            </div>
          )}
          <Button type='submit'>
            {props.beer.id === '' ? 'Add' : 'Update'} Beer
          </Button>
        </form>
      </Form>
    </div>
  )
}
