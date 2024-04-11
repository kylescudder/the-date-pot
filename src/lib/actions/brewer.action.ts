'use server'

import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'
import Brewery, { IBrewery } from '../models/brewery'

export async function getBreweryList() {
  try {
    connectToDB()

    return await Brewery.find({})
  } catch (error: any) {
    throw new Error(`Failed to find breweries: ${error.message}`)
  }
}

export async function addBrewery(brewery: IBrewery) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (brewery._id === '') {
      brewery._id = newId.toString()
    }

    return await Brewery.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(brewery._id) },
      {
        _id: new mongoose.Types.ObjectId(brewery._id),
        breweryName: brewery.breweryName
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add brewery: ${error.message}`)
  }
}
