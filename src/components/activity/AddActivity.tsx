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
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from '@/components/ui/multi-select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'

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
      window.location.href = `${url}/activities`
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col justify-start gap-4 pt-4 ${
            props.activity.id === '' ? 'p-4' : ''
          }`}
        >
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
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='expenseId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense</FormLabel>
                <MultiSelector
                  onValuesChange={field.onChange}
                  values={field.value}
                  list={expenseOptions}
                  single
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder='How spenny...?' />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {expenseOptions.map((expense) => (
                        <MultiSelectorItem
                          key={expense.value}
                          value={expense.value}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>{expense.label}</span>
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
              </FormItem>
            )}
          />
          <div className='my-2'>
            {props.longLat[0] !== 0 && props.longLat[1] !== 0 && (
              <Map
                longLat={props.longLat}
                title={props.activity.activityName}
              />
            )}
            {address !== undefined &&
              address !== '' &&
              props.longLat[0] === 0 &&
              props.longLat[1] === 0 && <ReloadMapPlaceholder />}
          </div>
          <Button type='submit'>
            {props.activity.id === '' ? 'Add' : 'Update'} Activity
          </Button>
        </form>
      </Form>
    </div>
  )
}
