'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { updateUser } from '@/lib/actions/user.actions'
import { Users } from '@/lib/models/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldValues, useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'

interface Props {
  user: Users
  btnTitle: string
}
const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const form = useForm({
    defaultValues: {
      image: user?.image ? user.image : '',
      username: user?.username ? user.username : '',
      name: user?.name ? user.name : '',
      bio: user?.bio ? user.bio : ''
    }
  })
  const [imageString, setImageString] = useState<string>(
    form.getValues('image')
  )

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

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('image')) return

    const fileReader = new FileReader()
    fileReader.onload = () => {
      const base64String = fileReader.result
      setImageString(base64String?.toString() || '')
      form.setValue('image', base64String?.toString() || '')
    }

    fileReader.readAsDataURL(file)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col justify-start gap-4'
      >
        {form.getValues('image') ? (
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
        <FormField
          control={form.control}
          name='name'
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel htmlFor='name'>Profile Picture</FormLabel>
              <FormControl>
                <div className='items-center gap-4'>
                  <Input
                    type='image'
                    {...form}
                    onChange={handleImage}
                    id='image'
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
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
                    placeholder="What's your name girl, what's you sign?"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='username'
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel htmlFor='username'>Username</FormLabel>
              <FormControl>
                <div className='items-center gap-4'>
                  <Input
                    {...field}
                    id='username'
                    className='text-base'
                    placeholder='your email address plz'
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel htmlFor='bio'>Bio</FormLabel>
              <FormControl>
                <div className='items-center gap-4'>
                  <Textarea
                    id='bio'
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button className='hover:bg-primary-hover' type='submit'>
          {btnTitle}
        </Button>
      </form>
    </Form>
  )
}

export default AccountProfile
