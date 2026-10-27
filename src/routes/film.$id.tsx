import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AddFilm from '@/components/film/AddFilm'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/film/$id')({ component: Film })

function Film() {
  const { id } = Route.useParams()
  const trpc = useTRPC()
  const film = useQuery(trpc.film.get.queryOptions(id))
  const directors = useQuery(trpc.lookups.directors.queryOptions())
  const genres = useQuery(trpc.lookups.genres.queryOptions())
  const platforms = useQuery(trpc.lookups.platforms.queryOptions())
  return (
    <PageState queries={[film, directors, genres, platforms]} what='that film'>
      {() => (
        <AddFilm
          key={film.dataUpdatedAt}
          film={film.data!}
          directorList={directors.data!}
          genreList={genres.data!}
          platformList={platforms.data!}
        />
      )}
    </PageState>
  )
}
