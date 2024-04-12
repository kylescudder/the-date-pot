'use server'

import BeerType, { IBeerType } from '../models/beer-type'
import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'

export async function getBeerTypeList() {
  try {
    connectToDB()

    return await BeerType.find({})
  } catch (error: any) {
    throw new Error(`Failed to find beer types: ${error.message}`)
  }
}

export async function addBeerType(beerType: IBeerType) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (beerType._id === '') {
      beerType._id = newId.toString()
    }

    return await BeerType.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(beerType._id) },
      {
        _id: new mongoose.Types.ObjectId(beerType._id),
        beerType: beerType.beerType
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add beer type: ${error.message}`)
  }
}
