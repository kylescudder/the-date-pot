"use server";

import { currentUser } from "@clerk/nextjs";
import Platform, { IPlatform } from "../models/platform";
import { connectToDB } from "../mongoose";
import mongoose from "mongoose";

export async function getPlatformList() {
  try {
    connectToDB();

    return await Platform.find({});
  } catch (error: any) {
    throw new Error(`Failed to find platforms: ${error.message}`);
  }
}
