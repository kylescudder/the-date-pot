import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IActivity {
  _id: string;
  archive: boolean;
  activityName: string;
  address: string;
  userGroupID: string;
  expense: string;
}
interface ActivityClass {
  _id: mongoose.Types.ObjectId;
  archive: boolean;
  activityName: string;
  address: string;
  userGroupID: mongoose.Types.ObjectId;
  expense: string;
}
const ActivitySchema = new mongoose.Schema<ActivityClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  archive: { type: Boolean },
  activityName: { type: String },
  address: { type: String },
  userGroupID: { type: mongoose.Schema.Types.ObjectId },
  expense: { type: String },
});

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);

export default Activity;
