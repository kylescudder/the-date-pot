import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import CoffeeList from '@/components/coffee/List'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/coffees')({ component: Coffees })

function Coffees() {
  const trpc = useTRPC()
  const coffees = useQuery(trpc.coffee.list.queryOptions())
  const users = useQuery(trpc.users.group.queryOptions())
  return (
    <PageState queries={[coffees, users]} what='the coffee list'>
      {() => (
        <div className='listPage'>
          <CoffeeList
            coffees={coffees.data!}
            users={users.data!}
            longLat={[0, 0]}
          />
        </div>
      )}
    </PageState>
  )
}
