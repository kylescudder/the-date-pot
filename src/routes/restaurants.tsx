import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import RestaurantList from '@/components/restaurant/List'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/restaurants')({ component: Restaurants })

function Restaurants() {
  const trpc = useTRPC()
  const restaurants = useQuery(trpc.restaurant.list.queryOptions())
  const cuisines = useQuery(trpc.lookups.cuisines.queryOptions())
  const whens = useQuery(trpc.lookups.whens.queryOptions())
  return (
    <PageState
      queries={[restaurants, cuisines, whens]}
      what='the restaurant list'
    >
      {() => (
        <div className='listPage'>
          <RestaurantList
            restaurants={restaurants.data!}
            longLat={[0, 0]}
            cuisineList={cuisines.data!}
            whenList={whens.data!}
          />
        </div>
      )}
    </PageState>
  )
}
