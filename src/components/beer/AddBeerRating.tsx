'usea   client'

import { Rating, Select } from '@mantine/core'
import { option } from '@/lib/models/select-options'
import { Beer, User } from '@/server/db/schema'
import { BeerRatings } from '@/lib/models/beerRatings'
import { updateBeerRating } from '@/lib/actions/beer.action'
import { Button } from '@/components/ui/button'
import { useForm, type FieldValues } from 'react-hook-form'
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
    defaultValues: {
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <div className='flex items-center pt-2 text-base'>
                <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
                  Taste
                </span>
                <FormControl>
                  <Rating {...field} name='taste' fractions={2} size='xl' />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='wankyness'
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <div className='flex items-center pt-2 text-base'>
                <span className='mr-2 inline-block w-32 rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-black text-gray-700'>
                  Wankyness
                </span>
                <FormControl>
                  <Rating {...field} name='wankyness' fractions={2} size='xl' />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <Button
          className='hover:bg-primary-hover bg-emerald-500 text-white'
          type='submit'
        >
          {props.beerRating.id === '' ? 'Add' : 'Update'} Rating
        </Button>
      </form>
    </Form>
  )
}
