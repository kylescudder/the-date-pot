"use server";

import { currentUser } from "@clerk/nextjs";
import Activity, { IActivity } from "../models/activity";
import { connectToDB } from "../mongoose";
import { getUserGroup, getUserInfo } from "./user.actions";
import mongoose from "mongoose";

export async function getActivityList(id: string) {
  try {
    connectToDB();

    return await Activity.find({
      userGroupID: id,
      archive: false,
    });
  } catch (error: any) {
    throw new Error(`Failed to find activities: ${error.message}`);
  }
}
export async function getActivity(id: string) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    return await Activity.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userGroupID: new mongoose.Types.ObjectId(userGroup._id),
    });
  } catch (error: any) {
    throw new Error(`Failed to find activity: ${error.message}`);
  }
}
export async function updateActivity(ActivityData: IActivity) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    const newId = new mongoose.Types.ObjectId();
    if (ActivityData._id === "") {
      ActivityData._id = newId.toString();
    }

    return await Activity.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(ActivityData._id) },
      {
        _id: new mongoose.Types.ObjectId(ActivityData._id),
        activityName: ActivityData.activityName,
        address: ActivityData.address,
        archive: ActivityData.archive,
        userGroupID: new mongoose.Types.ObjectId(userGroup._id),
        expense: ActivityData.expense,
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    throw new Error(`Failed to create/update activity: ${error.message}`);
  }
}
export async function archiveActivity(id: string) {
  try {
    connectToDB();

    return await Activity.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        archive: true,
      }
    );
  } catch (error: any) {
    throw new Error(`Failed to archive activity: ${error.message}`);
  }
}
