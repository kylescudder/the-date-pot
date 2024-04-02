'use server'

import Genre from '../models/genre'
import { connectToDB } from '../mongoose'

export async function getGenreList() {
  try {
    connectToDB()

    return await Genre.find({})
  } catch (error: any) {
    throw new Error(`Failed to find genres: ${error.message}`)
  }
}
