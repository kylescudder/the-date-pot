import { Badge, Card, Group, Text } from '@mantine/core'
import { IconCircleXFilled } from '@tabler/icons-react'

export default function NoteCard(props: {
  note: string
  func: (note: string) => void
}) {
  return (
    <Card
      className='bg-light-4 dark:bg-dark-4'
      shadow='sm'
      padding='lg'
      radius='md'
      withBorder
    >
      <div className='contents w-1/2'>
        <IconCircleXFilled
          onClick={() => props.func(props.note)}
          className='float-right text-danger'
        />
      </div>
      <Text className='text-dark-1 dark:text-light-1' fw={500}>
        {props.note}
      </Text>
    </Card>
  )
}
