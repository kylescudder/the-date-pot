import { IconCircleXFilled } from '@tabler/icons-react'
import { Card, CardContent } from '../ui/card'

export default function NoteCard(props: {
  note: string
  func: (note: string) => void
}) {
  return (
    <Card>
      <CardContent>
        <div className='flex items-center justify-between'>
          <p>{props.note}</p>
          <IconCircleXFilled
            onClick={() => props.func(props.note)}
            className='min-w-6 text-destructive'
          />
        </div>
      </CardContent>
    </Card>
  )
}
