import { randomUUID } from 'node:crypto'
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

// Content tables store the owning group's id in userGroupId (the column name is
// historical). Every query is scoped to the signed-in member's group.

// Activity
export const activity = createTable('activity', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id),
  address: varchar('address').notNull(),
  expenseId: uuid('expenseId').references(() => expense.id)
})

export type Activity = typeof activity.$inferSelect

export const activityTypes = createTable('activityTypes', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  activityId: uuid('activityId').references(() => activity.id),
  activityType: varchar('activityType').notNull(),
  activityTypeId: uuid('activityTypeId').references(() => activityType.id)
})

export type ActivityTypes = typeof activityTypes.$inferSelect

export const activityType = createTable('activityType', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  activityType: varchar('activityType').notNull()
})

export type ActivityType = typeof activityType.$inferSelect

// Beer
export const beerRating = createTable('beerRating', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  beerId: uuid('beerId').references(() => beer.id),
  userId: uuid('userId').references(() => user.id),
  wankyness: integer('wankyness').notNull(),
  taste: integer('taste').notNull()
})

export type BeerRating = typeof beerRating.$inferSelect

export const beer = createTable('beer', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  abv: doublePrecision('abv').notNull(),
  addedById: uuid('addedById').references(() => user.id),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id)
})

export type Beer = typeof beer.$inferSelect

export const beerBreweries = createTable('beerBreweries', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  beerId: uuid('beerId').references(() => beer.id),
  breweryId: uuid('breweryId').references(() => brewery.id)
})

export type BeerBreweries = typeof beerBreweries.$inferSelect

export const beerTypes = createTable('beerTypes', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  beerId: uuid('beerId').references(() => beer.id),
  beerTypeId: uuid('beerTypeId').references(() => beerType.id)
})

export type BeerTypes = typeof beerTypes.$inferSelect

export const beerType = createTable('beerType', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  beerType: varchar('beerType').notNull()
})

export type BeerType = typeof beerType.$inferSelect

export const brewery = createTable('brewery', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  breweryName: varchar('breweryName').notNull()
})

export type Brewery = typeof brewery.$inferSelect

// Coffee
export const coffeeRating = createTable('coffeeRating', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: uuid('userId').references(() => user.id),
  coffeeId: uuid('coffeeId').references(() => coffee.id),
  experience: integer('experience').notNull(),
  taste: integer('taste').notNull()
})

export type CoffeeRating = typeof coffeeRating.$inferSelect

export const coffee = createTable('coffee', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id),
  addedById: uuid('addedById').references(() => user.id),
  address: varchar('address').notNull()
})

export type Coffee = typeof coffee.$inferSelect

// Restaurant
export const cuisine = createTable('cuisine', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cuisine: varchar('cuisine').notNull()
})

export type Cuisine = typeof cuisine.$inferSelect

export const when = createTable('when', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  when: varchar('when').notNull()
})

export type When = typeof when.$inferSelect

export const restaurant = createTable('restaurant', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id),
  address: varchar('address').notNull()
})

export const restaurantNote = createTable('restaurantNote', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  note: varchar('note').notNull()
})

export type Restaurant = typeof restaurant.$inferSelect

export const restaurantCuisines = createTable('restaurantCuisines', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cuisineId: uuid('cuisineId').references(() => cuisine.id),
  restaurantId: uuid('restaurantId').references(() => restaurant.id)
})

export type RestaurantCuisines = typeof restaurantCuisines.$inferSelect

export const restaurantWhens = createTable('restaurantWhens', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  whenId: uuid('whenId').references(() => when.id),
  restaurantId: uuid('restaurantId').references(() => restaurant.id)
})

export type RestaurantWhens = typeof restaurantWhens.$inferSelect

// Film
export const filmDirectors = createTable('filmDirectors', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  filmId: uuid('filmId').references(() => film.id),
  directorId: uuid('directorId').references(() => director.id)
})

export type FilmDirectors = typeof filmDirectors.$inferSelect

export const filmGenres = createTable('filmGenres', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  filmId: uuid('filmId').references(() => film.id),
  genreId: uuid('genreId').references(() => genre.id)
})

export type FilmGenres = typeof filmGenres.$inferSelect

export const filmPlatforms = createTable('filmPlatforms', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  filmId: uuid('filmId').references(() => film.id),
  platformId: uuid('platformId').references(() => platform.id)
})

export type FilmPlatforms = typeof filmPlatforms.$inferSelect

export const film = createTable('film', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id),
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
    .$defaultFn(() => randomUUID()),
  genreText: varchar('genreText').notNull()
})

export type Genre = typeof genre.$inferSelect

export const director = createTable('director', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  directorName: varchar('directorName').notNull()
})

export type Director = typeof director.$inferSelect

export const platform = createTable('platform', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  platformName: varchar('platformName').notNull()
})

export type Platform = typeof platform.$inferSelect

// Holiday
export const holiday = createTable('holiday', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  country: varchar('country').notNull(),
  city: varchar('city').notNull(),
  been: boolean('been'),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id),
  dateBeen: timestamp('dateBeen').notNull()
})

export type Holiday = typeof holiday.$inferSelect

// General
export const expense = createTable('expense', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  expense: varchar('expense').notNull()
})

export type Expense = typeof expense.$inferSelect

export const pot = createTable('pot', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  potName: varchar('potName').notNull(),
  icon: varchar('icon').notNull()
})

export type Pot = typeof pot.$inferSelect

export const userGroupPots = createTable('userGroupPots', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: uuid('userId').references(() => user.id),
  userGroupId: uuid('userGroup').references(() => userGroups.id),
  potId: uuid('potId').references(() => pot.id),
  accepted: boolean('accepted')
})

export type UserGroupPots = typeof userGroupPots.$inferSelect

export const user = createTable('user', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  username: varchar('username').notNull(),
  clerkId: varchar('clerkId').notNull(),
  bio: varchar('bio')
})

export type User = typeof user.$inferSelect

export const group = createTable('group', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())
})

export type Group = typeof group.$inferSelect

export const userGroups = createTable('userGroups', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: uuid('userId').references(() => user.id),
  groupId: uuid('groupId').references(() => group.id)
})

export type UserGroups = typeof userGroups.$inferSelect

//Vinyls
export const vinyl = createTable('vinyl', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar('name').notNull(),
  artist: varchar('artist').notNull(),
  archive: boolean('archive'),
  userGroupId: uuid('userGroupId').references(() => group.id),
  addedById: uuid('addedById').references(() => user.id),
  purchased: boolean('purchased')
})

export type Vinyl = typeof vinyl.$inferSelect
