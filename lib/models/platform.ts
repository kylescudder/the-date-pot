import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IPlatform {
  _id: string;
  platformName: string;
}
interface PlatformClass {
  _id: mongoose.Types.ObjectId;
  platformName: string;
}
const platformSchema = new mongoose.Schema<PlatformClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  platformName: { type: String },
});

const Platform =
  mongoose.models.Platform || mongoose.model("Platform", platformSchema);

export default Platform;
