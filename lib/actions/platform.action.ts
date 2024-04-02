'use server'

import mongoose from 'mongoose'
import Platform, { IPlatform } from '../models/platform'
import { connectToDB } from '../mongoose'

export async function getPlatformList() {
  try {
    connectToDB()

    return await Platform.find({})
  } catch (error: any) {
    throw new Error(`Failed to find platforms: ${error.message}`)
  }
}

export async function addPlatform(platform: IPlatform) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (platform._id === '') {
      platform._id = newId.toString()
    }

    return await Platform.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(platform._id) },
      {
        _id: new mongoose.Types.ObjectId(platform._id),
        platformName: platform.platformName
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add platform: ${error.message}`)
  }
}
