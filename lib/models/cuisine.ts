import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ICuisine {
  _id: string;
  cuisine: string;
}
interface CuisineClass {
  _id: mongoose.Types.ObjectId;
  cuisine: string;
}
const cuisineSchema = new mongoose.Schema<CuisineClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  cuisine: { type: String },
});

const Cuisine = mongoose.models.Cuisine || mongoose.model("Cuisine", cuisineSchema);

export default Cuisine;
