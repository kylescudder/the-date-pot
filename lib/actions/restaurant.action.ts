"use server";

import { currentUser } from "@clerk/nextjs";
import Restaurant, { IRestaurant } from "../models/restaurant";
import { connectToDB } from "../mongoose";
import { getUserGroup, getUserInfo } from "./user.actions";
import mongoose from "mongoose";

export async function getRestaurantList(id: string) {
  try {
    connectToDB();

    return await Restaurant.find({
      userGroupID: id,
      archive: false,
    });
  } catch (error: any) {
    throw new Error(`Failed to find restaurants: ${error.message}`);
  }
}
export async function getRestaurant(id: string) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    return await Restaurant.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userGroupID: new mongoose.Types.ObjectId(userGroup._id),
    });
  } catch (error: any) {
    throw new Error(`Failed to find restaurant: ${error.message}`);
  }
}
export async function updateRestaurant(restaurantData: IRestaurant) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    const newId = new mongoose.Types.ObjectId();
    if (restaurantData._id === "") {
      restaurantData._id = newId.toString();
    }

    return await Restaurant.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(restaurantData._id) },
      {
        _id: new mongoose.Types.ObjectId(restaurantData._id),
        restaurantName: restaurantData.restaurantName,
        address: restaurantData.address,
        archive: restaurantData.archive,
        userGroupID: new mongoose.Types.ObjectId(userGroup._id),
        cuisines: restaurantData.cuisines,
        whens: restaurantData.whens,
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    throw new Error(`Failed to create/update restaurant: ${error.message}`);
  }
}
export async function archiveRestaurant(id: string) {
  try {
    connectToDB();

    return await Restaurant.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        archive: true,
      }
    );
  } catch (error: any) {
    throw new Error(`Failed to archive restaurant: ${error.message}`);
  }
}
