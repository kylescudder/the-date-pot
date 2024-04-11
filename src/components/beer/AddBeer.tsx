'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  archiveToast,
  deleteToast,
  successToast
} from '@/lib/actions/toast.actions'
import { IconTrash, IconCirclePlus, IconCircleMinus } from '@tabler/icons-react'
import { IBeer } from '@/lib/models/beer'
import {
  archiveBeer,
  deleteBeerRating,
  updateBeer,
  updateBeerRating
} from '@/lib/actions/beer.action'
import { IBeerRating } from '@/lib/models/beer-rating'
import { IBrewery } from '@/lib/models/brewery'
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
import { IUser } from '@/lib/models/user'
import AddBeerRating from './AddBeerRating'
import FullScreenModal from '../shared/FullScreenModal'
import { addBrewery } from '@/lib/actions/brewer.action'

export default function AddBeer(props: {
  beer: IBeer
  ratings: IBeerRating[]
  users: IUser[]
  breweryList: IBrewery[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)
  const [beerRatings, setBeerRatings] = useState<IBeerRating[]>(props.ratings)
  const [open, setOpen] = useState<boolean>(false)

  const breweryOptions: option[] = props.breweryList.map(
    (brewery: IBrewery) => ({
      value: brewery.breweryName,
      label: brewery.breweryName
    })
  )
  const [breweries, setBreweries] = useState<option[]>(breweryOptions)

  interface formBeer {
    _id: string
    archive: boolean
    beerName: string
    abv: number
    breweries: string[]
    addedByID: string
    userGroupID: string
    avgWankyness: number
    avgTaste: number
    avgRating: number
  }

  const beerRating: IBeerRating = {
    _id: '',
    beerID: '',
    wankyness: 0,
    taste: 0,
    userID: '',
    username: ''
  }

  const form = useForm({
    initialValues: {
      _id: props.beer._id ? props.beer._id : '',
      archive: props.beer.archive ? props.beer.archive : false,
      beerName: props.beer.beerName ? props.beer.beerName : '',
      abv: props.beer.abv ? props.beer.abv : 0,
      breweries: props.beer.breweries ? props.beer.breweries : [],
      addedByID: props.beer.addedByID ? props.beer.addedByID : '',
      userGroupID: props.beer.userGroupID ? props.beer.userGroupID : '',
      avgWankyness: 0,
      avgTaste: 0,
      avgRating: 0
    }
  })

  const handleRemoveRecord = async (id: string, index: number) => {
    const updatedArray = await beerRatings.filter((item, i) => item._id !== id)
    setBeerRatings(updatedArray)
    if (id !== '') {
      await deleteBeerRating(id)
    }
    const rating = await beerRatings.filter((item) => item._id === id)
    deleteToast(`${rating[0]!.username}'s rating`)
  }

  const onSubmit = async (values: formBeer) => {
    const payload: IBeer = {
      ...props.beer,
      beerName: values.beerName,
      abv: values.abv,
      breweries: values.breweries
    }

    const beer = await updateBeer(payload)
    beerRatings.map(async (rating: IBeerRating) => {
      const updatedRating = {
        ...rating,
        beerID: beer._id
      }
      await updateBeerRating(updatedRating)
    })
    if (pathname.includes('/beer/')) {
      successToast(beer.beerName)
      setChangesMade(true)
    } else {
      router.push(`/beer/${beer._id}`)
    }
  }

  const pullData = (data: boolean) => {
    setOpen(data)
  }

  const pullRating = async (data: IBeerRating) => {
    const newCatList = [...beerRatings, data]
    setBeerRatings(newCatList)
  }

  const handleArchive = async () => {
    await archiveBeer(props.beer._id)
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
      <div className="flex justify-between items-center">
        <BackButton
          record={props.beer}
          changesMade={changesMade}
          page="beers"
        />
        <Button
          radius="md"
          className={`bg-danger text-light-1 ${
            props.beer._id === '' ? 'hidden' : ''
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
          props.beer._id === '' ? 'px-6' : ''
        }`}
      >
        <TextInput
          label="Name"
          radius="md"
          placeholder="The best beer in the world"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps('beerName')}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query }
            const brewery: IBrewery = { _id: '', breweryName: query }
            setBreweries((current) => [...current, item])
            addBrewery(brewery)
            return item
          }}
          transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
          label="Breweries"
          placeholder="Pick some"
          data={breweries}
          {...form.getInputProps('breweries')}
        />
        <NumberInput
          label="ABV"
          radius="md"
          precision={1}
          step={0.1}
          placeholder="Session or strong?"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps('abv')}
        />
        <div className="flex justify-between">
          <div className="flex-grow pr-2">
            <p className="text-dark-1 dark:text-light-1 pt-3 inline-block text-base font-black">
              Ratings
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
        {beerRatings.length !== 0 ? (
          beerRatings.map((rating: IBeerRating, i: number) => {
            return (
              <div
                key={rating.userID}
                className="rounded-md overflow-hidden shadow-lg bg-light-3 dark:bg-dark-3 w-full"
              >
                <div className="px-6 py-4">
                  <div className="font-black w-1/2 contents text-xl mb-2 text-dark-1 dark:text-light-1">
                    {rating.username}
                  </div>
                  <div className="w-1/2 contents">
                    <IconCircleMinus
                      onClick={() => handleRemoveRecord(rating._id, i)}
                      className="text-danger float-right"
                    />
                  </div>
                  <div className="text-base flex items-center pt-2">
                    <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-black text-gray-700 mr-2">
                      Taste
                    </span>
                    <Rating
                      name="taste"
                      value={rating.taste}
                      onChange={(value) => handleTasteChange(value, i)}
                      fractions={2}
                      size="xl"
                    />
                  </div>
                  <div className="text-base flex items-center pt-5">
                    <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-black text-gray-700 mr-2">
                      Wankyness
                    </span>
                    <Rating
                      name="wankyness"
                      value={rating.wankyness}
                      onChange={(value) => handleWankynessChange(value, i)}
                      fractions={2}
                      size="xl"
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-md overflow-hidden shadow-lg bg-light-4 dark:bg-dark-4 w-full">
            <div className="px-6 py-4">
              <div className="font-bold w-1/2 contents text-xl mb-2 text-dark-1 dark:text-light-1">
                Please add a rating!
              </div>
            </div>
          </div>
        )}
        <Button
          radius="md"
          className="bg-primary-500 hover:bg-primary-hover text-light-1"
          type="submit"
        >
          {props.beer._id === '' ? 'Add' : 'Update'} Beer
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
        title="Add Rating"
      />
    </div>
  )
}
