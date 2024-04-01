'use server'

import { currentUser } from '@clerk/nextjs'
import Cuisine, { ICuisine } from '../models/cuisine'
import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'

export async function getCuisineList() {
  try {
    connectToDB()

    return await Cuisine.find({})
  } catch (error: any) {
    throw new Error(`Failed to find cuisines: ${error.message}`)
  }
}
