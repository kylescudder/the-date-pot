'use server'

import { currentUser } from '@clerk/nextjs'
import Vinyl, { IVinyl } from '../models/vinyl'
import { connectToDB } from '../mongoose'
import { getUserGroup, getUserInfo } from './user.actions'
import mongoose from 'mongoose'

export async function getVinylList(id: string) {
  try {
    connectToDB()

    return await Vinyl.find({
      userGroupID: id,
      archive: false
    })
  } catch (error: any) {
    throw new Error(`Failed to find vinyls: ${error.message}`)
  }
}
export async function getVinyl(id: string) {
  try {
    connectToDB()

    const user = await currentUser()
    if (!user) return null
    const userInfo = await getUserInfo(user?.id)
    const userGroup = await getUserGroup(userInfo._id)

    return await Vinyl.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userGroupID: new mongoose.Types.ObjectId(userGroup._id)
    })
  } catch (error: any) {
    throw new Error(`Failed to find vinyl: ${error.message}`)
  }
}
export async function updateVinyl(vinylData: IVinyl) {
  try {
    connectToDB()

    const user = await currentUser()
    if (!user) return null
    const userInfo = await getUserInfo(user?.id)
    const userGroup = await getUserGroup(userInfo._id)

    const newId = new mongoose.Types.ObjectId()
    if (vinylData._id === '') {
      vinylData._id = newId.toString()
    }

    return await Vinyl.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(vinylData._id) },
      {
        _id: new mongoose.Types.ObjectId(vinylData._id),
        name: vinylData.name,
        artistName: vinylData.artistName,
        purchased: vinylData.purchased,
        archive: vinylData.archive,
        addedByID: new mongoose.Types.ObjectId(userInfo._id),
        userGroupID: new mongoose.Types.ObjectId(userGroup._id)
      },
      { upsert: true, new: true }
    )
  } catch (error: any) {
    throw new Error(`Failed to create/update vinyl: ${error.message}`)
  }
}
export async function archiveVinyl(id: string) {
  try {
    connectToDB()

    return await Vinyl.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        archive: true
      }
    )
  } catch (error: any) {
    throw new Error(`Failed to archive vinyl: ${error.message}`)
  }
}
