'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { archiveActivity, updateActivity } from '@/lib/actions/activity.action'
import { archiveToast, successToast } from '@/lib/actions/toast.actions'
import { IconTrash, IconCaretUpDown, IconCheck } from '@tabler/icons-react'
import BackButton from '../shared/BackButton'
import Map from '../shared/Map'
import ReloadMapPlaceholder from '../shared/ReloadMapPlaceholder'
import { Activity, Expense } from '@/server/db/schema'
import { option } from '@/lib/models/select-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

export default function AddActivity(props: {
  activity: Activity
  longLat: number[]
  expenseList: Expense[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [changesMade, setChangesMade] = useState<boolean>(false)
  const [address, setAddress] = useState<string>(props.activity.address)

  useEffect(() => {
    console.log(address)
  }, [address])

  const expenseOptions: option[] = props.expenseList.map((user: Expense) => ({
    value: user.id,
    label: user.expense
  }))

  interface formActivity {
    id: string
    activityName: string
    address: string
    archive: boolean
    userGroupId: string
    expenseId: string
  }

  const form = useForm({
    defaultValues: {
      id: props.activity.id ? props.activity.id : '',
      activityName: props.activity.activityName
        ? props.activity.activityName
        : '',
      address: props.activity.address ? props.activity.address : '',
      archive: props.activity.archive ? props.activity.archive : false,
      userGroupId: props.activity.userGroupId ? props.activity.userGroupId : '',
      expenseId: props.activity.expenseId ? props.activity.expenseId : ''
    }
  })

  const onSubmit = async (values: formActivity) => {
    const payload: Activity = {
      ...props.activity,
      activityName: values.activityName,
      address: values.address,
      expenseId: values.expenseId
    }

    const [activity] = await updateActivity(payload)
    if (pathname.includes('/activity/')) {
      successToast(activity.activityName)
      setChangesMade(true)

      if (payload.address !== '') {
        setAddress(payload.address)
      }
    } else {
      router.push(`/activity/${activity.id}`)
    }
  }

  const handleArchive = async () => {
    await archiveActivity(props.activity.id)
    archiveToast(props.activity.activityName)
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/activitys`
    }, 1000)
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <BackButton
          record={props.activity}
          changesMade={changesMade}
          page='activities'
        />
        <Button
          className={`bg-destructive ${
            props.activity.id === '' ? 'hidden' : ''
          }`}
          onClick={handleArchive}
          aria-label='archive'
        >
          <IconTrash />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='activityName'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='activityName'>Name</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      id='activityName'
                      className='text-base'
                      placeholder='The good yum yum place'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='expenseId'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Expense</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-[200px] justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? expenseOptions.find(
                              (expense) => expense.value === field.value
                            )?.label
                          : 'Select language'}
                        <IconCaretUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[200px] p-0'>
                    <Command>
                      <CommandInput placeholder='Search language...' />
                      <CommandEmpty>No expense found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {expenseOptions.map((expense) => (
                            <CommandItem
                              value={expense.label}
                              key={expense.value}
                              onSelect={() => {
                                form.setValue('expenseId', expense.value)
                              }}
                            >
                              <IconCheck
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  expense.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {expense.label}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='address'
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel htmlFor='address'>Address</FormLabel>
                <FormControl>
                  <div className='items-center gap-4'>
                    <Input
                      {...field}
                      id='address'
                      className='text-base'
                      placeholder='Where it at?'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='my-2'>
            {props.longLat[0] !== undefined &&
              props.longLat[1] !== undefined && (
                <Map
                  longLat={props.longLat}
                  title={props.activity.activityName}
                />
              )}
            {address !== undefined &&
              address !== '' &&
              props.longLat[0] === undefined &&
              props.longLat[1] === undefined && <ReloadMapPlaceholder />}
          </div>
          <Button type='submit'>
            {props.activity.id === '' ? 'Add' : 'Update'} Activity
          </Button>
        </form>
      </Form>
    </div>
  )
}
