'use server'

import mongoose from 'mongoose'
import Genre, { IGenre } from '../models/genre'
import { connectToDB } from '../mongoose'

export async function getGenreList() {
  try {
    connectToDB()

    return await Genre.find({})
  } catch (error: any) {
    throw new Error(`Failed to find genres: ${error.message}`)
  }
}

export async function addGenre(genre: IGenre) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (genre._id === '') {
      genre._id = newId.toString()
    }

    return await Genre.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(genre._id) },
      {
        _id: new mongoose.Types.ObjectId(genre._id),
        genreText: genre.genreText
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add genre: ${error.message}`)
  }
}
