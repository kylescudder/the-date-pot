'use client'

import { ChangeEvent, useState } from 'react'
import { Restaurants } from '@/lib/models/restaurants'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
    props.addNote(note)
  }
  return (
    <div className='p-6'>
      <Label htmlFor='note'>Note</Label>
      <Textarea
        placeholder='Penny for your thoughts?'
        onChange={handleChange}
        className='mt-2'
      />
      <Button type='button' onClick={handleSubmit} className='mt-4 w-full'>
        {props.restaurant.id === '' ? 'Add' : 'Update'} Note
      </Button>
    </div>
  )
}
