"use server";

import { revalidatePath } from "next/cache";
import User, { IUser } from "../models/user";
import { connectToDB } from "../mongoose";
import { clerkClient } from "@clerk/nextjs";
import { convertBase64ToFile } from "../utils";
import UserGroupPot, { IUserGroupPot } from "../models/user-group-pot";
import Pot from "../models/pot";
import mongoose from "mongoose";

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
    const newId = new mongoose.Types.ObjectId();
    console.log(userData.image);
    const newUser = await User.findOneAndUpdate(
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
export async function getUserGroupPots(id: string) {
  try {
    connectToDB();

    const userGroupPots: IUserGroupPot[] = await UserGroupPot.find({
      userID: id,
    });
    console.log(userGroupPots)
    const pots = await Promise.all(
      userGroupPots.map(async (element) => {
        const pot = await Pot.findOne({ _id: element.potID });
        return pot;
      })
    );
    pots.sort((a, b) => a!.potName.localeCompare(b!.potName));
    return pots;
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
