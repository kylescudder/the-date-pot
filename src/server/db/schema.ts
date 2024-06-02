import { uuidv4 } from '@/lib/utils'
import {
  pgTableCreator,
  timestamp,
  varchar,
  boolean,
  uuid,
  integer,
  doublePrecision
} from 'drizzle-orm/pg-core'

export const createTable = pgTableCreator((name) => `${name}`)

// Activity
export const activity = createTable('activity', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  activityName: varchar('activityName').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  address: varchar('address').notNull(),
  expenseId: uuid('expenseId').references(() => expense.id)
})

export type Activity = typeof activity.$inferSelect

export const activityTypes = createTable('activityTypes', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  activityId: uuid('activityId').references(() => activity.id),
  activityType: varchar('activityType').notNull(),
  activityTypeId: uuid('activityTypeId').references(() => activityType.id)
})

export type ActivityTypes = typeof activityTypes.$inferSelect

export const activityType = createTable('activityType', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  activityType: varchar('activityType').notNull()
})

export type ActivityType = typeof activityType.$inferSelect

// Beer
export const beerRating = createTable('beerRating', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  beerId: uuid('beerId').references(() => beer.id),
  userId: uuid('userId').references(() => user.id),
  wankyness: integer('wankyness').notNull(),
  taste: integer('taste').notNull(),
  username: varchar('username')
})

export type BeerRating = typeof beerRating.$inferSelect

export const beer = createTable('beer', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  beerName: varchar('beerName').notNull(),
  abv: doublePrecision('abv').notNull(),
  addedById: uuid('addedById').references(() => user.id),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  avgWankyness: integer('avgWankyness'),
  avgTaste: integer('avgTaste'),
  avgRating: integer('avgRating')
})

export type Beer = typeof beer.$inferSelect

export const beerBreweries = createTable('beerBreweries', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  beerId: uuid('beerId').references(() => beer.id),
  breweryId: uuid('breweryId').references(() => brewery.id)
})

export type BeerBreweries = typeof beerBreweries.$inferSelect

export const beerTypes = createTable('beerTypes', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  beerId: uuid('beerId').references(() => beer.id),
  beerTypeId: uuid('beerTypeId').references(() => beerType.id)
})

export type BeerTypes = typeof beerTypes.$inferSelect

export const beerType = createTable('beerType', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  beerType: varchar('beerType').notNull()
})

export type BeerType = typeof beerType.$inferSelect

export const brewery = createTable('brewery', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  breweryName: varchar('breweryName').notNull()
})

export type Brewery = typeof brewery.$inferSelect

// Coffee
export const coffeeRating = createTable('coffeeRating', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: uuid('userId').references(() => user.id),
  coffeeId: uuid('coffeeId').references(() => coffee.id),
  experience: integer('experience').notNull(),
  taste: integer('taste').notNull(),
  username: varchar('username')
})

export type CoffeeRating = typeof coffeeRating.$inferSelect

export const coffee = createTable('coffee', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  coffeeName: varchar('coffeeName').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  addedById: uuid('addedById').references(() => user.id),
  userId: uuid('userId').references(() => user.id),
  avgExperience: integer('avgExperience'),
  avgTaste: integer('avgTaste'),
  avgRating: integer('avgRating'),
  address: varchar('address').notNull()
})

export type Coffee = typeof coffee.$inferSelect

// Restaurant
export const cuisine = createTable('cuisine', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  cuisine: varchar('cuisine').notNull()
})

export type Cuisine = typeof cuisine.$inferSelect

export const when = createTable('when', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  when: varchar('when').notNull()
})

export type When = typeof when.$inferSelect

export const restaurant = createTable('restaurant', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  restaurantName: varchar('restaurantName').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  address: varchar('address').notNull()
})

export const restaurantNote = createTable('restaurantNote', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  note: varchar('note').notNull()
})

export type Restaurant = typeof restaurant.$inferSelect

export const restaurantCuisines = createTable('restaurantCuisines', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  cuisineId: uuid('cuisineId').references(() => cuisine.id),
  restaurantId: uuid('restaurantId').references(() => restaurant.id)
})

export type RestaurantCuisines = typeof restaurantCuisines.$inferSelect

export const restaurantWhens = createTable('restaurantWhens', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  whenId: uuid('whenId').references(() => when.id),
  restaurantId: uuid('restaurantId').references(() => restaurant.id)
})

export type RestaurantWhens = typeof restaurantWhens.$inferSelect

// Film
export const filmDirectors = createTable('filmDirectors', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  filmId: uuid('filmId').references(() => film.id),
  directorId: uuid('directorId').references(() => director.id)
})

export type FilmDirectors = typeof filmDirectors.$inferSelect

export const filmGenres = createTable('filmGenres', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  filmId: uuid('filmId').references(() => film.id),
  genreId: uuid('genreId').references(() => genre.id)
})

export type FilmGenres = typeof filmGenres.$inferSelect

export const filmPlatforms = createTable('filmPlatforms', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  filmId: uuid('filmId').references(() => film.id),
  platformId: uuid('platformId').references(() => platform.id)
})

export type FilmPlatforms = typeof filmPlatforms.$inferSelect

export const film = createTable('film', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  filmName: varchar('filmName').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  addedById: uuid('addedById').references(() => user.id),
  addedDate: timestamp('addedDate').notNull(),
  releaseDate: timestamp('releaseDate').notNull(),
  runTime: integer('runTime').notNull(),
  watched: boolean('watched')
})

export type Film = typeof film.$inferSelect

export const genre = createTable('genre', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  genreText: varchar('genreText').notNull()
})

export type Genre = typeof genre.$inferSelect

export const director = createTable('director', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  directorName: varchar('directorName').notNull()
})

export type Director = typeof director.$inferSelect

export const platform = createTable('platform', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  platformName: varchar('platformName').notNull()
})

export type Platform = typeof platform.$inferSelect

// Holiday
export const holiday = createTable('holiday', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  country: varchar('country').notNull(),
  city: varchar('city').notNull(),
  been: boolean('been'),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  dateBeen: timestamp('dateBeen').notNull()
})

export type Holiday = typeof holiday.$inferSelect

// General
export const expense = createTable('expense', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  expense: varchar('expense').notNull()
})

export type Expense = typeof expense.$inferSelect

export const pot = createTable('pot', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  potName: varchar('potName').notNull(),
  icon: varchar('icon').notNull()
})

export type Pot = typeof pot.$inferSelect

export const userGroupPots = createTable('userGroupPots', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: uuid('userId').references(() => user.id),
  userGroupId: uuid('userGroup').references(() => userGroups.id),
  potId: uuid('potId').references(() => pot.id),
  accepted: boolean('accepted')
})

export type UserGroupPots = typeof userGroupPots.$inferSelect

export const user = createTable('user', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: varchar('name').notNull(),
  username: varchar('username').notNull(),
  clerkId: varchar('clerkId').notNull(),
  bio: varchar('bio'),
  onboarded: boolean('onboarded')
})

export type User = typeof user.$inferSelect

export const group = createTable('group', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4())
})

export type Group = typeof group.$inferSelect

export const userGroups = createTable('userGroups', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: uuid('userId').references(() => user.id),
  groupId: uuid('groupId').references(() => group.id)
})

export type UserGroups = typeof userGroups.$inferSelect

//Vinyls
export const vinyl = createTable('vinyl', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: varchar('name').notNull(),
  artistName: varchar('artistName').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => userGroups.id),
  addedById: uuid('addedById').references(() => user.id),
  purchased: boolean('purchased')
})

export type Vinyl = typeof vinyl.$inferSelect
