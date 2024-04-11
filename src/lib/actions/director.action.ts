'use server'

import mongoose from 'mongoose'
import Director, { IDirector } from '../models/director'
import { connectToDB } from '../mongoose'

export async function getDirectorList() {
  try {
    connectToDB()

    return await Director.find({})
  } catch (error: any) {
    throw new Error(`Failed to find directors: ${error.message}`)
  }
}
export async function addDirector(director: IDirector) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (director._id === '') {
      director._id = newId.toString()
    }

    return await Director.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(director._id) },
      {
        _id: new mongoose.Types.ObjectId(director._id),
        directorName: director.directorName
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add director: ${error.message}`)
  }
}
