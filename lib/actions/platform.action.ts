'use server'

import Platform from '../models/platform'
import { connectToDB } from '../mongoose'

export async function getPlatformList() {
  try {
    connectToDB()

    return await Platform.find({})
  } catch (error: any) {
    throw new Error(`Failed to find platforms: ${error.message}`)
  }
}
