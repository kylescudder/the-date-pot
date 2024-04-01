'use server'

import { currentUser } from '@clerk/nextjs'
import When, { IWhen } from '../models/when'
import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'

export async function getWhenList() {
  try {
    connectToDB()

    return await When.find({})
  } catch (error: any) {
    throw new Error(`Failed to find whens: ${error.message}`)
  }
}
