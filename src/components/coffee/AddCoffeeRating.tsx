'use client'

import { updateCoffeeRating } from '@/lib/actions/coffee.action'
import { Button, Rating, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { option } from '@/lib/models/select-options'
import { Coffee, User } from '@/server/db/schema'
import { CoffeeRatings } from '@/lib/models/coffeeRatings'

export default function AddCoffeeRating(props: {
  coffee: Coffee
  coffeeRating: CoffeeRatings
  users: User[]
  addRating: (data: CoffeeRatings) => void
  func: (data: boolean) => void
}) {
  const options: option[] = props.users.map((user: User) => ({
    value: user.id,
    label: user.name
  }))

  interface formRating {
    id: string
    coffeeId: string
    experience: number
    taste: number
    userId: string
    username: string
  }

  const form = useForm({
    initialValues: {
      id: props.coffeeRating.id ? props.coffeeRating.id : '',
      coffeeId: props.coffee.id ? props.coffee.id : '',
      experience: props.coffeeRating.experience
        ? props.coffeeRating.experience
        : 0,
      taste: props.coffeeRating.taste ? props.coffeeRating.taste : 0,
      userId: props.coffeeRating.userId ? props.coffeeRating.userId : '',
      username: props.coffeeRating.username ? props.coffeeRating.username : ''
    }
  })

  const onSubmit = async (values: formRating) => {
    const filteredUsers = props.users.filter(
      (user) => user.id === values.userId
    )
    const username = filteredUsers.length > 0 ? filteredUsers[0]!.name : ''
    const payload: CoffeeRatings = {
      id: values.id,
      coffeeId: props.coffee.id,
      experience: values.experience,
      taste: values.taste,
      userId: values.userId,
      username: username
    }
    if (payload.coffeeId !== '') {
      const rating = await updateCoffeeRating(payload)
      const ratingWithUsername: CoffeeRatings = {
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
        props.coffee.id === '' ? 'px-6' : ''
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
          Experience
        </span>
        <Rating
          name='experience'
          fractions={2}
          size='xl'
          {...form.getInputProps('experience')}
        />
      </div>
      <Button
        radius='md'
        className='bg-primary-500 text-light-1 hover:bg-primary-hover'
        type='submit'
      >
        {props.coffeeRating.id === '' ? 'Add' : 'Update'} Rating
      </Button>
    </form>
  )
}
