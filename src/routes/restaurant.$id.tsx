import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AddRestaurant from '@/components/restaurant/AddRestaurant'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/restaurant/$id')({
  component: Restaurant
})

function Restaurant() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const restaurant = useQuery(trpc.restaurant.get.queryOptions(id))
  const cuisines = useQuery(trpc.lookups.cuisines.queryOptions())
  const whens = useQuery(trpc.lookups.whens.queryOptions())
  const address = restaurant.data?.address ?? ''
  const longLat = useQuery({
    ...trpc.maps.lookup.queryOptions(address),
    enabled: !!address
  })
  return (
    <PageState
      queries={[restaurant, cuisines, whens, ...(address ? [longLat] : [])]}
      what='that restaurant'
    >
      {() => (
        <AddRestaurant
          key={restaurant.dataUpdatedAt}
          restaurant={restaurant.data!}
          longLat={longLat.data ?? []}
          cuisineList={cuisines.data!}
          whenList={whens.data!}
        />
      )}
    </PageState>
  )
}
