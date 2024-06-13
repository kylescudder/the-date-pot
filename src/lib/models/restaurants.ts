import { Restaurant } from '@/server/db/schema'

export interface Restaurants extends Restaurant {
  cuisines: string[]
  whens: string[]
  notes: string[]
}
