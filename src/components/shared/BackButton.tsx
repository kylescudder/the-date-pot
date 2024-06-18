import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconArrowNarrowLeft } from '@tabler/icons-react'
import { Button } from '@mantine/core'

export default function BackButton(props: {
  record: any
  changesMade: boolean
  page: string
}) {
  const [changesMade, setChangesMade] = useState<boolean>(props.changesMade)

  useEffect(() => {
    setChangesMade(props.changesMade)
  }, [props.changesMade])

  const router = useRouter()
  const handleBack = () => {
    if (changesMade) {
      const url = `${window.location.protocol}//${window.location.host}`
      window.location.href = `${url}/${props.page}`
    } else {
      router.back()
    }
  }

  return (
    <Button
      radius='md'
      className={`hover:bg-primary-hover bg-emerald-500 ${
        props.record.id === '' ? 'hidden' : ''
      }`}
      onClick={handleBack}
      aria-label='back'
    >
      <IconArrowNarrowLeft className='text-white' />
    </Button>
  )
}
