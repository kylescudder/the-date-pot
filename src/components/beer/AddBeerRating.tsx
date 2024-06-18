'use client'

import { Rating, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { option } from '@/lib/models/select-options'
import { Beer, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'
import { updateBeerRating } from '@/lib/actions/beer.action'
import { Button } from '@/components/ui/button'

export default function AddBeerRating(props: {
  beer: Beer
  beerRating: BeerRatings
  users: User[]
  addRating: (data: BeerRatings) => void
  func: (data: boolean) => void
}) {
  const options: option[] = props.users.map((user: User) => ({
    value: user.id,
    label: user.name
  }))

  interface formRating {
    id: string
    beerId: string
    wankyness: number
    taste: number
    userId: string
    username: string
  }

  const form = useForm({
    initialValues: {
      id: props.beerRating.id ? props.beerRating.id : '',
      beerId: props.beer.id ? props.beer.id : '',
      wankyness: props.beerRating.wankyness ? props.beerRating.wankyness : 0,
      taste: props.beerRating.taste ? props.beerRating.taste : 0,
      userId: props.beerRating.userId ? props.beerRating.userId : '',
      username: props.beerRating.username ? props.beerRating.username : ''
    }
  })

  const onSubmit = async (values: formRating) => {
    const filteredUsers = props.users.filter(
      (user) => user.id === values.userId
    )
    const username = filteredUsers.length > 0 ? filteredUsers[0]!.name : ''
    const payload: BeerRatings = {
      id: values.id,
      beerId: props.beer.id,
      wankyness: values.wankyness,
      taste: values.taste,
      userId: values.userId,
      username: username
    }
    if (payload.beerId !== '') {
      const rating = await updateBeerRating(payload)
      const ratingWithUsername: BeerRatings = {
        ...rating,
        username: username
      }
      props.addRating(ratingWithUsername)
    } else {
      props.addRating(payload)
    }
    props.func(false)
  }

  return (
    <form
      onSubmit={form.onSubmit((values) => onSubmit(values))}
      className={`flex flex-col justify-start gap-10 pt-4 ${
        props.beer.id === '' ? 'px-6' : ''
      }`}
    >
      <Select
        radius='md'
        size='md'
        clearable
        transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}
        label='Who?'
        placeholder='Pick one'
        data={options}
        {...form.getInputProps('userId')}
      />
      <div className='flex items-center pt-2 text-base'>
        <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
          Taste
        </span>
        <Rating
          name='taste'
          fractions={2}
          size='xl'
          {...form.getInputProps('taste')}
        />
      </div>
      <div className='flex items-center pt-5 text-base'>
        <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
          Wankyness
        </span>
        <Rating
          name='wankyness'
          fractions={2}
          size='xl'
          {...form.getInputProps('wankyness')}
        />
      </div>
      <Button
        className='hover:bg-primary-hover bg-emerald-500 text-white'
        type='submit'
      >
        {props.beerRating.id === '' ? 'Add' : 'Update'} Rating
      </Button>
    </form>
  )
}
