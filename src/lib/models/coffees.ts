import { Coffee } from '@/server/db/schema'

export interface Coffees extends Coffee {
  avgExperience: number
  avgTaste: number
  avgRating: number
}
