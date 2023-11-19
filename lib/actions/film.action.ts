"use server";

import { currentUser } from "@clerk/nextjs";
import Film, { IFilm } from "../models/film";
import { connectToDB } from "../mongoose";
import { getUserGroup, getUserInfo } from "./user.actions";
import mongoose from "mongoose";

export async function getFilmList(id: string) {
  try {
    connectToDB();

    return await Film.find({
      userGroupID: id,
      archive: false,
    });
  } catch (error: any) {
    throw new Error(`Failed to find films: ${error.message}`);
  }
}
export async function getFilm(id: string) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    return await Film.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userGroupID: new mongoose.Types.ObjectId(userGroup._id),
    });
  } catch (error: any) {
    throw new Error(`Failed to find film: ${error.message}`);
  }
}
export async function updateFilm(filmData: IFilm) {
  try {
    connectToDB();

    const user = await currentUser();
    if (!user) return null;
    const userInfo = await getUserInfo(user?.id);
    const userGroup = await getUserGroup(userInfo._id);

    const newId = new mongoose.Types.ObjectId();
    if (filmData._id === "") {
      filmData._id = newId.toString();
    }

    return await Film.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(filmData._id) },
      {
        _id: new mongoose.Types.ObjectId(filmData._id),
        addedDate: filmData.addedDate,
        archive: filmData.archive,
        filmName: filmData.filmName,
        releaseDate: filmData.releaseDate,
        runTime: filmData.runTime,
        userGroupID: new mongoose.Types.ObjectId(userGroup._id),
        watched: filmData.watched,
        directors: filmData.directors,
        genres: filmData.genres,
        platforms: filmData.platforms,
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    throw new Error(`Failed to create/update film: ${error.message}`);
  }
}
export async function archiveFilm(id: string) {
  try {
    connectToDB();

    return await Film.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        archive: true,
      }
    );
  } catch (error: any) {
    throw new Error(`Failed to archive film: ${error.message}`);
  }
}
