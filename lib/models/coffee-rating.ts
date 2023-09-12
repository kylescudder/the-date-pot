import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ICoffeeRating {
  _id: string;
  coffeeID: string;
  experience: number;
  taste: number;
  userID: string;
  username: string;
}
interface CoffeeRatingClass {
  _id: mongoose.Types.ObjectId;
  coffeeID: mongoose.Types.ObjectId;
  experience: number;
  taste: number;
  userID: mongoose.Types.ObjectId;
  username: string;
}
const CoffeeRatingSchema = new mongoose.Schema<CoffeeRatingClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  coffeeID: { type: mongoose.Schema.Types.ObjectId },
  experience: { type: Number },
  taste: { type: Number },
  userID: { type: mongoose.Schema.Types.ObjectId },
  username: { type: String }
});

const CoffeeRating =
  mongoose.models.CoffeeRating ||
  mongoose.model("CoffeeRating", CoffeeRatingSchema);

export default CoffeeRating;
