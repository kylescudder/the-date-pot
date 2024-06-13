'use client'

import React, { useState } from 'react'
import { useForm } from '@mantine/form'
import { usePathname, useRouter } from 'next/navigation'
import { archiveVinyl, updateVinyl } from '@/lib/actions/vinyl.action'
import { archiveToast, successToast } from '@/lib/actions/toast.actions'
import { IconTrash } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import { Button, Checkbox, TextInput } from '@mantine/core'
import { Vinyl } from '@/server/db/schema'

export default function AddVinyl(props: { vinyl: Vinyl }) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)

  interface formVinyl {
    id: string
    name: string
    artistName: string
    purchased: boolean
    archive: boolean
    addedById: string
    userGroupId: string
  }

  const form = useForm({
    initialValues: {
      id: props.vinyl.id ? props.vinyl.id : '',
      name: props.vinyl.name ? props.vinyl.name : '',
      artistName: props.vinyl.artistName ? props.vinyl.artistName : '',
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
      artistName: values.artistName,
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
          className={`bg-danger text-light-1 ${
            props.vinyl.id === '' ? 'hidden' : ''
          }`}
          onClick={handleArchive}
          aria-label='archive'
        >
          <IconTrash className='text-dark-1 dark:text-light-1' />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.vinyl.id === '' ? 'px-6' : ''
        }`}
      >
        <TextInput
          label='Name'
          radius='md'
          placeholder='The next AOTY'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('name')}
        />
        <TextInput
          label='Artist Name'
          radius='md'
          placeholder='GOATs only plz'
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('artistName')}
        />
        <Checkbox
          mt='md'
          radius='md'
          label={<p className='text-dark-1 dark:text-light-1'>Purchased</p>}
          className='text-dark-2 dark:text-light-2'
          size='md'
          {...form.getInputProps('purchased', { type: 'checkbox' })}
        />
        <Button
          radius='md'
          className='bg-primary-500 text-light-1 hover:bg-primary-hover'
          type='submit'
        >
          {props.vinyl.id === '' ? 'Add' : 'Update'} Vinyl
        </Button>
      </form>
    </div>
  )
}
