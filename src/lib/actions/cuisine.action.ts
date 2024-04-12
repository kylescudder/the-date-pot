'use server'

import mongoose from 'mongoose'
import Cuisine, { ICuisine } from '../models/cuisine'
import { connectToDB } from '../mongoose'

export async function getCuisineList() {
  try {
    connectToDB()

    return await Cuisine.find({})
  } catch (error: any) {
    throw new Error(`Failed to find cuisines: ${error.message}`)
  }
}

export async function addCuisine(cuisine: ICuisine) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (cuisine._id === '') {
      cuisine._id = newId.toString()
    }

    return await Cuisine.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(cuisine._id) },
      {
        _id: new mongoose.Types.ObjectId(cuisine._id),
        cuisine: cuisine.cuisine
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add cuisine: ${error.message}`)
  }
}
