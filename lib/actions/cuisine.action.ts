'use server'

import Cuisine from '../models/cuisine'
import { connectToDB } from '../mongoose'

export async function getCuisineList() {
  try {
    connectToDB()

    return await Cuisine.find({})
  } catch (error: any) {
    throw new Error(`Failed to find cuisines: ${error.message}`)
  }
}
