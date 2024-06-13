import { CoffeeRating } from '@/server/db/schema'

export interface CoffeeRatings extends CoffeeRating {
  username: string
}
