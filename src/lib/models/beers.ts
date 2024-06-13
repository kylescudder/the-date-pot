import { Beer, BeerBreweries, BeerTypes } from '@/server/db/schema'

export interface Beers extends Beer {
  avgWankyness: number
  avgTaste: number
  avgRating: number
  breweries: string[]
  beerTypes: string[]
}
