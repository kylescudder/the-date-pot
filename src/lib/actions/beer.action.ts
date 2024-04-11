'use server'

import { currentUser } from '@clerk/nextjs'
import { connectToDB } from '../mongoose'
import { getUserGroup, getUserInfo } from './user.actions'
import mongoose from 'mongoose'
import Beer, { IBeer } from '../models/beer'
import BeerRating, { IBeerRating } from '../models/beer-rating'
import User from '../models/user'

export async function getBeerList(id: string) {
  try {
    connectToDB()

    const beers: IBeer[] = await Beer.find({
      userGroupID: id,
      archive: false
    })

    await Promise.all(
      beers.map(async (element) => {
        const beerRatings: IBeerRating[] = await BeerRating.find({
          beerID: new mongoose.Types.ObjectId(element._id)
        })

        let wankyness = 0
        let taste = 0
        await Promise.all(
          beerRatings.map(async (rec) => {
            wankyness += rec.wankyness
            taste += rec.taste
          })
        )

        element.avgWankyness = wankyness /= beerRatings.length
        element.avgTaste = taste /= beerRatings.length
        const avg = (wankyness + taste) / beerRatings.length
        element.avgRating = Math.round(avg * 2) / 2
      })
    )
    return beers
  } catch (error: any) {
    throw new Error(`Failed to find beers: ${error.message}`)
  }
}
export async function getBeer(id: string) {
  try {
    connectToDB()

    const user = await currentUser()
    if (!user) return null
    const userInfo = await getUserInfo(user?.id)
    const userGroup = await getUserGroup(userInfo._id)

    return await Beer.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userGroupID: new mongoose.Types.ObjectId(userGroup._id)
    })
  } catch (error: any) {
    throw new Error(`Failed to find beer: ${error.message}`)
  }
}
export async function getBeerRatings(id: string) {
  try {
    connectToDB()

    const ratings = await BeerRating.find({
      beerID: id
    })

    await Promise.all(
      ratings.map(async (rating) => {
        const u = await User.findById({
          _id: rating.userID
        })
        rating.username = u.name
      })
    )
    return ratings
  } catch (error: any) {
    throw new Error(`Failed to find beer ratings: ${error.message}`)
  }
}
export async function deleteBeerRating(id: string) {
  try {
    connectToDB()

    await BeerRating.deleteOne({
      _id: id
    })
  } catch (error: any) {
    throw new Error(`Failed to find beer ratings: ${error.message}`)
  }
}
export async function updateBeerRating(beerRatingData: IBeerRating) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (beerRatingData._id === '') {
      beerRatingData._id = newId.toString()
    }

    const rating = await BeerRating.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(beerRatingData._id) },
      {
        _id: new mongoose.Types.ObjectId(beerRatingData._id),
        beerID: new mongoose.Types.ObjectId(beerRatingData.beerID),
        userID: new mongoose.Types.ObjectId(beerRatingData.userID),
        wankyness: beerRatingData.wankyness,
        taste: beerRatingData.taste
      },
      { upsert: true, new: true }
    )

    return rating
  } catch (error: any) {
    throw new Error(`Failed to create/update beer ratings: ${error.message}`)
  }
}
export async function updateBeer(beerData: IBeer) {
  try {
    connectToDB()

    const user = await currentUser()
    if (!user) return null
    const userInfo = await getUserInfo(user?.id)
    const userGroup = await getUserGroup(userInfo._id)

    const newId = new mongoose.Types.ObjectId()
    if (beerData._id === '') {
      beerData._id = newId.toString()
    }

    return await Beer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(beerData._id) },
      {
        _id: new mongoose.Types.ObjectId(beerData._id),
        beerName: beerData.beerName,
        abv: beerData.abv,
        breweries: beerData.breweries,
        archive: beerData.archive,
        addedByID: new mongoose.Types.ObjectId(userInfo._id),
        userGroupID: new mongoose.Types.ObjectId(userGroup._id)
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to create/update beer: ${error.message}`)
  }
}
export async function archiveBeer(id: string) {
  try {
    connectToDB()

    return await Beer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        archive: true
      }
    )
  } catch (error: any) {
    throw new Error(`Failed to archive beer: ${error.message}`)
  }
}
export async function getNewBeerID() {
  try {
    return new mongoose.Types.ObjectId().toString()
  } catch (error: any) {
    throw new Error(`Failed to get new beer ID: ${error.message}`)
  }
}
