'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { archiveVinyl, updateVinyl } from '@/lib/actions/vinyl.action'
import { archiveToast, successToast } from '@/lib/actions/toast.actions'
import { IconTrash } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import { Vinyl } from '@/server/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldValues, Form, useForm } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form'

export default function AddVinyl(props: { vinyl: Vinyl }) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)

  interface formVinyl {
    id: string
    name: string
    artist: string
    purchased: boolean
    archive: boolean
    addedById: string
    userGroupId: string
  }

  const form = useForm({
    defaultValues: {
      id: props.vinyl.id ? props.vinyl.id : '',
      name: props.vinyl.name ? props.vinyl.name : '',
      artist: props.vinyl.artist ? props.vinyl.artist : '',
      purchased: props.vinyl.purchased ? props.vinyl.purchased : false,
      archive: props.vinyl.archive ? props.vinyl.archive : false,
      addedById: props.vinyl.addedById ? props.vinyl.addedById : '',
      userGroupId: props.vinyl.userGroupId ? props.vinyl.userGroupId : ''
    }
  })

  const onSubmit = async (values: formVinyl) => {
    const payload: Vinyl = {
      ...props.vinyl,
      name: values.name,
      artist: values.artist,
      purchased: values.purchased
    }

    const [vinyl] = await updateVinyl(payload)

    if (pathname.includes('/vinyl/')) {
      successToast(vinyl.name)
      setChangesMade(true)
    } else {
      router.push(`/vinyl/${vinyl.id}`)
    }
  }

  const handleArchive = async () => {
    await archiveVinyl(props.vinyl.id)
    archiveToast(props.vinyl.name)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/vinyls`
    }, 1000)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.vinyl}
          changesMade={changesMade}
          page='vinyls'
        />
        <Button
          className={`${props.vinyl.id === '' ? 'hidden' : ''}`}
          onClick={handleArchive}
          aria-label='archive'
          variant={'destructive'}
        >
          <IconTrash />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col justify-start gap-4 pt-4 ${
            props.vinyl.id === '' ? 'p-4' : ''
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
                      placeholder='The next AOTY'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='artist'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='name'>Artist Name</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      id='artist'
                      className='text-base'
                      placeholder='GOATs only plz'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='purchased'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Purchased</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type='submit'>
            {props.vinyl.id === '' ? 'Add' : 'Update'} Vinyl
          </Button>
        </form>
      </Form>
    </div>
  )
}
