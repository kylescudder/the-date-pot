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
    <div>
      <Label htmlFor='note'>Note</Label>
      <Textarea
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
