import { Badge, Card, Group, Text } from '@mantine/core'
import { IconCircleXFilled } from '@tabler/icons-react'

export default function NoteCard(props: {
  note: string
  func: (note: string) => void
}) {
  return (
    <Card
      className='text-zinc-700 dark:text-black'
      shadow='sm'
      padding='lg'
      radius='md'
      withBorder
    >
      <div className='contents w-1/2'>
        <IconCircleXFilled
          onClick={() => props.func(props.note)}
          className='text-danger float-right'
        />
      </div>
      <Text className='text-zinc-900 dark:text-white' fw={500}>
        {props.note}
      </Text>
    </Card>
  )
}
