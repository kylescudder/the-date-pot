"use server";

import { revalidatePath } from "next/cache";
import User, { IUser } from "../models/user";
import { connectToDB } from "../mongoose";
import { clerkClient, currentUser } from "@clerk/nextjs";
import { convertBase64ToFile } from "../utils";
import UserGroupPot, { IUserGroupPot } from "../models/user-group-pot";
import Pot from "../models/pot";
import mongoose from "mongoose";
import UserGroup, { IUserGroup } from "../models/user-group";

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

    const users: IUser[] = await Promise.all(
      groupUsers.users.map(async (element: string) => {
        const user = await User.findOne({ _id: element });
        return user;
      })
    );

    return users;
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
