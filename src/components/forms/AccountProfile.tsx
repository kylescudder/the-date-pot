'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { updateUser } from '@/lib/actions/user.actions'
import { FileInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Users } from '@/lib/models/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  user: Users
  btnTitle: string
}
const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const form = useForm({
    initialValues: {
      image: user?.image ? user.image : '',
      username: user?.username ? user.username : '',
      name: user?.name ? user.name : '',
      bio: user?.bio ? user.bio : ''
    }
  })
  const [imageString, setImageString] = useState<string>(form.values.image)

  interface formUser {
    image: string
    username: string
    name: string
    bio: string
  }
  const onSubmit = async (values: formUser) => {
    const payload: Users = {
      id: '',
      username: values.username,
      name: values.name,
      bio: values.bio,
      clerkId: user.clerkId,
      image: values.image,
      onboarded: true
    }
    await updateUser(payload, pathname)
    if (pathname === '/profile/edit') {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleImage = (e: File) => {
    const fileReader = new FileReader()
    if (!e.type.includes('image')) return

    fileReader.onload = () => {
      const base64String = fileReader.result
      setImageString(base64String?.toString() || '')
      form.values.image = base64String?.toString() || ''
    }

    fileReader.readAsDataURL(e)
  }

  return (
    <form
      onSubmit={form.onSubmit((values) => onSubmit(values))}
      className='flex flex-col justify-start gap-4'
    >
      {form.values.image ? (
        <Image
          src={imageString}
          alt='profile_icon'
          width={96}
          height={96}
          priority
          className='rounded-full object-contain'
        />
      ) : (
        <Image
          src='/assets/profile.svg'
          alt='profile_icon'
          width={24}
          height={24}
          className='object-contain'
        />
      )}
      <FileInput
        label='Profile Picture'
        radius='md'
        size='md'
        {...form.getInputProps('image')}
        onChange={(e) => handleImage(e!)}
      />
      <Label htmlFor='name'>Name</Label>
      <Input
        placeholder="What's your name girl, what's you sign?"
        {...form.getInputProps('name')}
      />
      <Label htmlFor='username'>Username</Label>
      <Input
        placeholder='your email address plz'
        {...form.getInputProps('username')}
      />
      <Label htmlFor='bio'>Bio</Label>
      <Textarea
        placeholder='Tell me a little bit about yourself...'
        className='text-lg font-semibold leading-6'
        {...form.getInputProps('bio')}
      />
      <Button className='hover:bg-primary-hover' type='submit'>
        {btnTitle}
      </Button>
    </form>
  )
}

export default AccountProfile
