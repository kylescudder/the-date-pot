'use client'

import { updateCoffeeRating } from '@/lib/actions/coffee.action'
import { option } from '@/lib/models/select-options'
import { Coffee, User } from '@/server/db/schema'
import { CoffeeRatings } from '@/lib/models/coffeeRatings'
import { Button } from '@/components/ui/button'
import { Controller, FieldValues, useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from '../ui/multi-select'
import { StarRating } from '../ui/star-rating'

export default function AddCoffeeRating(props: {
  coffee: Coffee
  coffeeRating: CoffeeRatings
  users: User[]
  addRating: (data: CoffeeRatings) => void
}) {
  const options: option[] = props.users.map((user: User) => ({
    value: user.id,
    label: user.name
  }))

  const form = useForm({
    defaultValues: {
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

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const values = form.getValues()

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
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleRatingSubmit}
        className='flex flex-col justify-start gap-4 p-4'
      >
        <FormField
          control={form.control}
          name='userId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who?</FormLabel>
              <MultiSelector
                onValuesChange={field.onChange}
                values={field.value}
                list={options}
                single
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput placeholder='Pick one' />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {options.map((option) => (
                      <MultiSelectorItem
                        key={option.value}
                        value={option.value}
                      >
                        <div className='flex items-center space-x-2'>
                          <span>{option.label}</span>
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
          name='taste'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taste</FormLabel>
              <FormControl>
                <Controller
                  name='taste'
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                    <StarRating
                      max={5}
                      value={value}
                      onChange={(newValue) => {
                        onChange(newValue)
                      }}
                      increment={0.5}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='experience'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Controller
                  name='experience'
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                    <StarRating
                      max={5}
                      value={value}
                      onChange={(newValue) => {
                        onChange(newValue)
                      }}
                      increment={0.5}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>
          {props.coffeeRating.id === '' ? 'Add' : 'Update'} Rating
        </Button>
      </form>
    </Form>
  )
}
