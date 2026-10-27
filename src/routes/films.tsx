import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import FilmList from '@/components/film/List'
import PageState from '@/components/shared/PageState'
import { useTRPC } from '@/lib/trpc'

export const Route = createFileRoute('/films')({ component: Films })

function Films() {
  const trpc = useTRPC()
  const films = useQuery(trpc.film.list.queryOptions())
  const directors = useQuery(trpc.lookups.directors.queryOptions())
  const genres = useQuery(trpc.lookups.genres.queryOptions())
  const platforms = useQuery(trpc.lookups.platforms.queryOptions())
  return (
    <PageState
      queries={[films, directors, genres, platforms]}
      what='the film list'
    >
      {() => (
        <div className='listPage'>
          <FilmList
            films={films.data!}
            directorList={directors.data!}
            genreList={genres.data!}
            platformList={platforms.data!}
          />
        </div>
      )}
    </PageState>
  )
}
