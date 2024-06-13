import { BeerRating } from '@/server/db/schema'

export interface BeerRatings extends BeerRating {
  username: string
}
