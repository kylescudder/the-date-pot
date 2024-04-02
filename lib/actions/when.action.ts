'use server'

import mongoose from 'mongoose'
import When, { IWhen } from '../models/when'
import { connectToDB } from '../mongoose'

export async function getWhenList() {
  try {
    connectToDB()

    return await When.find({})
  } catch (error: any) {
    throw new Error(`Failed to find whens: ${error.message}`)
  }
}

export async function addWhen(when: IWhen) {
  try {
    connectToDB()

    const newId = new mongoose.Types.ObjectId()
    if (when._id === '') {
      when._id = newId.toString()
    }

    return await When.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(when._id) },
      {
        _id: new mongoose.Types.ObjectId(when._id),
        when: when.when
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to add when: ${error.message}`)
  }
}
