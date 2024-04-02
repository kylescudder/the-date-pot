'use server'

import Director from '../models/director'
import { connectToDB } from '../mongoose'

export async function getDirectorList() {
  try {
    connectToDB()

    return await Director.find({})
  } catch (error: any) {
    throw new Error(`Failed to find directors: ${error.message}`)
  }
}
