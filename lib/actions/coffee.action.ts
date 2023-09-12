"use server";

import { currentUser } from "@clerk/nextjs";
import { connectToDB } from "../mongoose";
import { getUserGroup, getUserInfo } from "./user.actions";
import mongoose from "mongoose";
import Coffee, { ICoffee } from "../models/coffee";
import CoffeeRating, { ICoffeeRating } from "../models/coffee-rating";
import User, { IUser } from "../models/user";

export async function getCoffeeList(id: string) {
  try {
    connectToDB();

    const coffees: ICoffee[] = await Coffee.find({
      userGroupID: id,
      archive: false,
    });

    await Promise.all(
      coffees.map(async (element) => {
        const coffeeRatings: ICoffeeRating[] = await CoffeeRating.find({
          coffeeID: new mongoose.Types.ObjectId(element._id),
        });

        let experience = 0;
        let taste = 0;
        await Promise.all(
          coffeeRatings.map(async (rec) => {
            experience += rec.experience;
            taste += rec.taste;
          })
        );

        element.avgExperience = experience /= coffeeRatings.length;
        element.avgTaste = taste /= coffeeRatings.length;
        const avg = ((experience + taste) / coffeeRatings.length)
        element.avgRating = Math.round(avg * 2) / 2;
      })
    );
    return coffees
  } catch (error: any) {
    throw new Error(`Failed to find coffees: ${error.message}`);
  }
}
export async function getCoffee(id: string) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    return await Coffee.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userGroupID: new mongoose.Types.ObjectId(userGroup._id),
    });
  } catch (error: any) {
    throw new Error(`Failed to find coffee: ${error.message}`);
  }
}
export async function getCoffeeRatings(id: string) {
  try {
    connectToDB();

    const ratings = await CoffeeRating.find({
      coffeeID: id,
    });

    await Promise.all(
      ratings.map(async (rating) => {
        const u = await User.findById({
          _id: rating.userID,
        });
        rating.username = u.name
      })
    );
    return ratings;
  } catch (error: any) {
    throw new Error(`Failed to find coffee ratings: ${error.message}`);
  }
}
export async function updateCoffee(coffeeData: ICoffee) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    const newId = new mongoose.Types.ObjectId();
    if (coffeeData._id === "") {
      coffeeData._id = newId.toString();
    }

    return await Coffee.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(coffeeData._id) },
      {
        _id: new mongoose.Types.ObjectId(coffeeData._id),
        coffeeName: coffeeData.coffeeName,
        archive: coffeeData.archive,
        addedByID: new mongoose.Types.ObjectId(userInfo._id),
        userGroupID: new mongoose.Types.ObjectId(userGroup._id),
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    throw new Error(`Failed to create/update coffee: ${error.message}`);
  }
}
export async function archiveCoffee(id: string) {
  try {
    connectToDB();

    return await Coffee.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        archive: true,
      }
    );
  } catch (error: any) {
    throw new Error(`Failed to archive coffee: ${error.message}`);
  }
}
