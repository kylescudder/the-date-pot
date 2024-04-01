'use server'

import { currentUser } from '@clerk/nextjs'
import Genre, { IGenre } from '../models/genre'
import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'

export async function getGenreList() {
  try {
    connectToDB()

    return await Genre.find({})
  } catch (error: any) {
    throw new Error(`Failed to find genres: ${error.message}`)
  }
}
