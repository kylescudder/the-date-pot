"use server"

import Vinyl from "../models/vinyl";
import { connectToDB } from "../mongoose";

export async function getVinylList(id: string) {
	try {
		console.log('getVinylList')
    connectToDB();
		
    const list = await Vinyl.find({
			userGroupID: id,
    });
		console.log('list: ', list)
		return list
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
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