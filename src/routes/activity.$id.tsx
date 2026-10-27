import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AddActivity from '@/components/activity/AddActivity'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/activity/$id')({ component: Activity })

function Activity() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const activity = useQuery(trpc.activity.get.queryOptions(id))
  const expenses = useQuery(trpc.lookups.expenses.queryOptions())
  const address = activity.data?.address ?? ''
  const longLat = useQuery({
    ...trpc.maps.lookup.queryOptions(address),
    enabled: !!address
  })
  return (
    <PageState
      queries={[activity, expenses, ...(address ? [longLat] : [])]}
      what='that activity'
    >
      {() => (
        <AddActivity
          key={activity.dataUpdatedAt}
          activity={activity.data!}
          expenseList={expenses.data!}
          longLat={longLat.data ?? []}
        />
      )}
    </PageState>
  )
}
