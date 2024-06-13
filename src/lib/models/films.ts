import { Film } from '@/server/db/schema'

export interface Films extends Film {
  directors: string[]
  genres: string[]
  platforms: string[]
}
