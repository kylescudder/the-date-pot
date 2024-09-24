'use client'

import React, { useState } from 'react'
import { useForm } from '@mantine/form'
import { usePathname, useRouter } from 'next/navigation'
import { archiveVinyl, updateVinyl } from '@/lib/actions/vinyl.action'
import { archiveToast, successToast } from '@/lib/actions/toast.actions'
import { IconTrash } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import { Vinyl } from '@/server/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

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
    initialValues: {
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
          className={`bg-danger text-white ${
            props.vinyl.id === '' ? 'hidden' : ''
          }`}
          onClick={handleArchive}
          aria-label='archive'
        >
          <IconTrash />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.vinyl.id === '' ? 'px-6' : ''
        }`}
      >
        <Label htmlFor='name'>Name</Label>
        <Input placeholder='The next AOTY' {...form.getInputProps('name')} />
        <Label htmlFor='artist'>Artist Name</Label>
        <Input
          placeholder='GOATs only plz'
          {...form.getInputProps('artist')}
        />
        <Checkbox {...form.getInputProps('purchased', { type: 'checkbox' })} />
        <label
          htmlFor='terms'
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          Purchased
        </label>
        <Button className='hover:bg-primary-hover' type='submit'>
          {props.vinyl.id === '' ? 'Add' : 'Update'} Vinyl
        </Button>
      </form>
    </div>
  )
}
