'use server'

import Pot from '../models/pot'
import { connectToDB } from '../mongoose'

export async function getPots() {
  try {
    connectToDB()

    return await Pot.find()
  } catch (error: any) {
    throw new Error(`Failed to get pots: ${error.message}`)
  }
}
//export async function updateUser(userData: IUser, path: string) {
//  try {
//    connectToDB();

//		await User.findOneAndUpdate(
//			{ clerkId: userData.clerkId }, {
//			_id: userData._id,
//			username: userData.username,
//			clerkId: userData.clerkId,
//			name: userData.name,
//			bio: userData.bio,
//			onboarded: true
//    }, { upsert: true, new: true })

//    const file: File = convertBase64ToFile(userData.image)
//    clerkClient.users.updateUserProfileImage(userData.clerkId, { file: file }).catch(err => console.table(err.errors));

//    if (path === "/profile/edit") {
//      revalidatePath(path);
//    }
//  } catch (error: any) {
//    throw new Error(`Failed to create/update user: ${error.message}`);
//  }
//}
