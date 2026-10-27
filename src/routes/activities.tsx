import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import ActivityList from '@/components/activity/List'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/activities')({ component: Activities })

function Activities() {
  const trpc = useTRPC()
  const activities = useQuery(trpc.activity.list.queryOptions())
  const expenses = useQuery(trpc.lookups.expenses.queryOptions())
  return (
    <PageState queries={[activities, expenses]} what='the activity list'>
      {() => (
        <div className='listPage'>
          <ActivityList
            activities={activities.data!}
            expenseList={expenses.data!}
            longLat={[0, 0]}
          />
        </div>
      )}
    </PageState>
  )
}
