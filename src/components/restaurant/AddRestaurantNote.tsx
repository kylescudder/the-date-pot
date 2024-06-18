'use client'

import { Textarea } from '@mantine/core'
import { ChangeEvent, useState } from 'react'
import { addRestaurantNote } from '@/lib/actions/restaurant.action'
import { Restaurants } from '@/lib/models/restaurants'
import { Button } from '@/components/ui/button'

export default function AddRestaurantNote(props: {
  restaurant: Restaurants
  restaurantNote: string
  addNote: (data: string) => void
}) {
  const [note, setNote] = useState<string>('')

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }
  const handleSubmit = async () => {
    await addRestaurantNote(note, props.restaurant.id)
    props.addNote(note)
  }
  return (
    <div>
      <Textarea
        minRows={8}
        radius='md'
        size='md'
        label='Note'
        placeholder='Penny for your thoughts?'
        onChange={handleChange}
      />
      <Button
        className='hover:bg-primary-hover mt-3 bg-emerald-500 text-white'
        type='button'
        onClick={handleSubmit}
      >
        {props.restaurant.id === '' ? 'Add' : 'Update'} Note
      </Button>
    </div>
  )
}
