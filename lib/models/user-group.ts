import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUserGroup {
  _id: string;
  groupOwnerID: string;
}
interface UserGroupClass {
  _id: mongoose.Types.ObjectId;
  groupOwnerID: mongoose.Types.ObjectId;
}
const userGroupSchema = new mongoose.Schema<UserGroupClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  groupOwnerID: { type: mongoose.Schema.Types.ObjectId },
});

const UserGroup =
  mongoose.models.UserGroup ||
  mongoose.model("UserGroup", userGroupSchema);

export default UserGroup;
