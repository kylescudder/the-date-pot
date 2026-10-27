import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AddCoffee from '@/components/coffee/AddCoffee'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/coffee/$id')({ component: Coffee })

function Coffee() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const coffee = useQuery(trpc.coffee.get.queryOptions(id))
  const ratings = useQuery(trpc.coffee.ratings.queryOptions(id))
  const users = useQuery(trpc.users.group.queryOptions())
  const address = coffee.data?.address ?? ''
  const longLat = useQuery({
    ...trpc.maps.lookup.queryOptions(address),
    enabled: !!address
  })
  return (
    <PageState
      queries={[coffee, ratings, users, ...(address ? [longLat] : [])]}
      what='that coffee'
    >
      {() => (
        <AddCoffee
          key={coffee.dataUpdatedAt}
          coffee={coffee.data!}
          ratings={ratings.data!}
          users={users.data!}
          longLat={longLat.data ?? []}
        />
      )}
    </PageState>
  )
}
