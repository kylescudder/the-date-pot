import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IBeerRating {
  _id: string;
  beerID: string;
  wankyness: number;
  taste: number;
  userID: string;
  username: string;
}
interface BeerRatingClass {
  _id: mongoose.Types.ObjectId;
  beerID: mongoose.Types.ObjectId;
  wankyness: number;
  taste: number;
  userID: mongoose.Types.ObjectId;
  username: string;
}
const BeerRatingSchema = new mongoose.Schema<BeerRatingClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  beerID: { type: mongoose.Schema.Types.ObjectId },
  wankyness: { type: Number },
  taste: { type: Number },
  userID: { type: mongoose.Schema.Types.ObjectId },
  username: { type: String },
});

const BeerRating =
  mongoose.models.BeerRating ||
  mongoose.model("BeerRating", BeerRatingSchema);

export default BeerRating;
