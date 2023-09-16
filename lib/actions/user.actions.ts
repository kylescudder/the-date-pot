"use server";

import { revalidatePath } from "next/cache";
import User, { IUser } from "../models/user";
import { connectToDB } from "../mongoose";
import { clerkClient, currentUser } from "@clerk/nextjs";
import { convertBase64ToFile } from "../utils";
import mongoose from "mongoose";
import UserGroup from "../models/user-group";

export async function getUserInfo(id: string) {
  try {
    connectToDB();

    return await User.findOne({
      clerkId: id,
    });
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
export async function updateUser(userData: IUser, path: string) {
  try {
    connectToDB();

    const user = await User.findOneAndUpdate(
      { clerkId: userData.clerkId },
      {
        username: userData.username,
        clerkId: userData.clerkId,
        name: userData.name,
        bio: userData.bio,
        onboarded: true,
      },
      { upsert: true, new: true }
    );
      console.log(user)
    await UserGroup.findOneAndUpdate(
      {
        users: user._id,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        users: [new mongoose.Types.ObjectId(user._id)],
      },
      { upsert: true, new: true }
    );
    if (userData.image) {
      if (!userData.image.includes("https://img.clerk.com")) {
        const file: File = convertBase64ToFile(userData.image);
        clerkClient.users
          .updateUserProfileImage(userData.clerkId, { file: file })
          .catch((err) => console.table(err.errors));
      }
    }

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
export async function getUserGroup(id: string) {
  try {
    connectToDB();

    return await UserGroup.findOne({
      users: id,
    });
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
export async function getGroupUsers() {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;

    const userInfo: IUser = await getUserInfo(user.id);
    const groupUsers = await getUserGroup(userInfo._id);

    const idArray: string[] = []
    groupUsers.users.map(async (element: string) => {
      idArray.push(element)
    })
    
    return await User.find({ _id: idArray });
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
