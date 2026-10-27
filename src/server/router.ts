import { router } from './trpc'
import { beerRouter } from './routers/beer'
import { coffeeRouter } from './routers/coffee'
import { filmRouter } from './routers/film'
import { activityRouter, restaurantRouter, vinylRouter } from './routers/places'
import { lookupsRouter, mapsRouter, usersRouter } from './routers/shared'

export const appRouter = router({
  activity: activityRouter,
  beer: beerRouter,
  coffee: coffeeRouter,
  film: filmRouter,
  lookups: lookupsRouter,
  maps: mapsRouter,
  restaurant: restaurantRouter,
  users: usersRouter,
  vinyl: vinylRouter
})
export type AppRouter = typeof appRouter
