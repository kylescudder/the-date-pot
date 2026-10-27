import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AddVinyl from '@/components/vinyl/AddVinyl'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/vinyl/$id')({ component: Vinyl })

function Vinyl() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const vinyl = useQuery(trpc.vinyl.get.queryOptions(id))
  return (
    <PageState queries={[vinyl]} what='that vinyl'>
      {() => <AddVinyl key={vinyl.dataUpdatedAt} vinyl={vinyl.data!} />}
    </PageState>
  )
}
