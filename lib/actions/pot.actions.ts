//"use server"

//import { revalidatePath } from "next/cache";
//import User, { IUser } from "../models/user";
//import { connectToDB } from "../mongoose";
//import { clerkClient } from "@clerk/nextjs";
//import { convertBase64ToFile } from "../utils";

//export async function getUser(id: string) {
//  try {
//    connectToDB();

//   const userGroupPots: IUserGroupPot[] = await UserGroupPot.find({
//			userID: req.params.id
//		})
//		if (!userGroupPots) {
//			return res
//				.status(404)
//				.json({ success: false, error: 'User pots not found' })
//		}
//		const pots = await Promise.all(userGroupPots.map(async (element) => {
//			const pot = await Pot.findOne({ _id: element.potID })
//			return pot
//		}))
//		pots.sort((a, b) => a!.potName.localeCompare(b!.potName))
//		return res.status(200).json({ success: true, data: pots })
//	} catch (err) {
//		return res.status(400).json({ success: false, error: err })
//	}
//  } catch (error: any) {
//    throw new Error(`Failed to create/update user: ${error.message}`);
//  }
//}

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