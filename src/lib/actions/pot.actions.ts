'use server'

import { db } from '@/server/db'
import { auth } from '@clerk/nextjs/server'
import { log } from '@logtail/next'

export async function getPots() {
  try {
    const user = await auth()

    if (!user.userId) {
      log.error('Unauthorised')
      throw new Error()
    }

    return await db.query.pot.findMany({})
  } catch (error: any) {
    log.error(`Failed to get pots: ${error.message}`)
    throw new Error()
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
//    log.error(`Failed to create/update user: ${error.message}`)
//    throw new Error();
//  }
//}
