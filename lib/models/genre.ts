import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IGenre {
  _id: string;
  genreText: string;
}
interface GenreClass {
  _id: mongoose.Types.ObjectId;
  genreText: string;
}
const genreSchema = new mongoose.Schema<GenreClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  genreText: { type: String },
});

const Genre = mongoose.models.Genre || mongoose.model("Genre", genreSchema);

export default Genre;
