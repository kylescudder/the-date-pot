import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AddBeer from '@/components/beer/AddBeer'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/beer/$id')({ component: Beer })

function Beer() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const beer = useQuery(trpc.beer.get.queryOptions(id))
  const ratings = useQuery(trpc.beer.ratings.queryOptions(id))
  const users = useQuery(trpc.users.group.queryOptions())
  const breweries = useQuery(trpc.lookups.breweries.queryOptions())
  const beerTypes = useQuery(trpc.lookups.beerTypes.queryOptions())
  return (
    <PageState
      queries={[beer, ratings, users, breweries, beerTypes]}
      what='that beer'
    >
      {() => (
        <AddBeer
          key={beer.dataUpdatedAt}
          beer={beer.data!}
          ratings={ratings.data!}
          users={users.data!}
          breweryList={breweries.data!}
          beerTypeList={beerTypes.data!}
        />
      )}
    </PageState>
  )
}
