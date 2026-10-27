import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import VinylList from '@/components/vinyl/List'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/vinyls')({ component: Vinyls })

function Vinyls() {
  const trpc = useTRPC()
  const vinyls = useQuery(trpc.vinyl.list.queryOptions())
  return (
    <PageState queries={[vinyls]} what='the vinyl list'>
      {() => (
        <div className='listPage'>
          <VinylList vinyls={vinyls.data!} />
        </div>
      )}
    </PageState>
  )
}
