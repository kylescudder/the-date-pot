// Client calls used by the forms. The names match the former server actions.
import type { BeerRatings } from './models/beerRatings'
import type { Beers } from './models/beers'
import type { Films } from './models/films'
import type { Restaurants } from './models/restaurants'
import type { Activity, Coffee, CoffeeRating, Vinyl } from '@/server/db/schema'
import { api, refresh } from './trpc'

async function changed<T>(result: Promise<T>) {
  const value = await result
  await refresh()
  return value
}

export const updateBeer = (beer: Beers) =>
  changed(
    api().beer.save.mutate({
      id: beer.id,
      name: beer.name,
      abv: beer.abv === null ? null : Number(beer.abv),
      archive: beer.archive,
      breweries: beer.breweries,
      beerTypes: beer.beerTypes
    })
  )
export const archiveBeer = (id: string) =>
  changed(api().beer.archive.mutate(id))
export const updateBeerRating = (rating: BeerRatings) =>
  changed(
    api().beer.saveRating.mutate({
      id: rating.id,
      beerId: rating.beerId ?? '',
      userId: rating.userId ?? '',
      wankyness: rating.wankyness,
      taste: rating.taste
    })
  )
export const deleteBeerRating = (rating: BeerRatings) =>
  changed(api().beer.deleteRating.mutate(rating.id))

export const updateCoffee = (coffee: Coffee) =>
  changed(
    api().coffee.save.mutate({
      id: coffee.id,
      name: coffee.name,
      address: coffee.address,
      archive: coffee.archive
    })
  )
export const archiveCoffee = (id: string) =>
  changed(api().coffee.archive.mutate(id))
export const updateCoffeeRating = (rating: CoffeeRating) =>
  changed(
    api().coffee.saveRating.mutate({
      id: rating.id,
      coffeeId: rating.coffeeId ?? '',
      userId: rating.userId ?? '',
      experience: rating.experience,
      taste: rating.taste
    })
  )
export const deleteCoffeeRating = (rating: CoffeeRating) =>
  changed(api().coffee.deleteRating.mutate(rating.id))

export const updateFilm = (film: Films) =>
  changed(
    api().film.save.mutate({
      id: film.id,
      name: film.name,
      archive: film.archive,
      addedDate: film.addedDate,
      releaseDate: film.releaseDate,
      runTime: Number(film.runTime),
      watched: film.watched,
      directors: film.directors,
      genres: film.genres,
      platforms: film.platforms
    })
  )
export const archiveFilm = (id: string) =>
  changed(api().film.archive.mutate(id))

export const updateRestaurant = (restaurant: Restaurants) =>
  changed(
    api().restaurant.save.mutate({
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      archive: restaurant.archive,
      cuisines: restaurant.cuisines,
      whens: restaurant.whens
    })
  )
export const archiveRestaurant = (id: string) =>
  changed(api().restaurant.archive.mutate(id))
// Notes have never been stored, so there is nothing to delete on the server.
export const deleteRestaurantNote = async (_note: string, _id: string) => {}

export const updateActivity = (activity: Activity) =>
  changed(
    api().activity.save.mutate({
      id: activity.id,
      name: activity.name,
      address: activity.address,
      archive: activity.archive,
      expenseId: activity.expenseId || null
    })
  )
export const archiveActivity = (id: string) =>
  changed(api().activity.archive.mutate(id))

export const updateVinyl = (vinyl: Vinyl) =>
  changed(
    api().vinyl.save.mutate({
      id: vinyl.id,
      name: vinyl.name,
      artist: vinyl.artist,
      archive: vinyl.archive,
      purchased: vinyl.purchased
    })
  )
export const archiveVinyl = (id: string) =>
  changed(api().vinyl.archive.mutate(id))
