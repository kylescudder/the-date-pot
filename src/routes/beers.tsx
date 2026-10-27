import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import BeerList from '@/components/beer/List'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/beers')({ component: Beers })

function Beers() {
  const trpc = useTRPC()
  const beers = useQuery(trpc.beer.list.queryOptions())
  const users = useQuery(trpc.users.group.queryOptions())
  const breweries = useQuery(trpc.lookups.breweries.queryOptions())
  const beerTypes = useQuery(trpc.lookups.beerTypes.queryOptions())
  return (
    <PageState
      queries={[beers, users, breweries, beerTypes]}
      what='the beer list'
    >
      {() => (
        <div className='listPage'>
          <BeerList
            beers={beers.data!}
            users={users.data!}
            breweryList={breweries.data!}
            beerTypeList={beerTypes.data!}
          />
        </div>
      )}
    </PageState>
  )
}
