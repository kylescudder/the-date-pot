'use server'

import { currentUser } from '@clerk/nextjs'
import Director, { IDirector } from '../models/director'
import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'

export async function getDirectorList() {
  try {
    connectToDB()

    return await Director.find({})
  } catch (error: any) {
    throw new Error(`Failed to find directors: ${error.message}`)
  }
}
