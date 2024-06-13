import { Modal } from '@mantine/core'
import { useEffect, useState } from 'react'
import { IconCross } from '@tabler/icons-react'

export default function FormModal(props: {
  open: boolean
  func: (open: boolean) => void
  form: React.ReactElement
  title: string
}) {
  const handleClose = () => {
    setOpen(false)
    props.func(false)
  }

  const [open, setOpen] = useState<boolean>(props.open)

  useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  return (
    <Modal.Root
      opened={open}
      onClose={handleClose}
      transitionProps={{ transition: 'slide-up', duration: 200 }}
    >
      <Modal.Content className='bg-white dark:bg-zinc-900'>
        <Modal.Header className='bg-white dark:bg-zinc-900'>
          <IconCross
            onClick={handleClose}
            aria-label='close'
            width={24}
            height={24}
            strokeLinejoin='miter'
          />
          <Modal.Title className='text-zinc-900 dark:text-white'>
            {props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.form}</Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
