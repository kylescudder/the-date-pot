import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUserGroupPot {
  _id: string;
  userGroupID: string;
  userID: string;
  potID: string;
  accepter: boolean;
}
interface UserGroupPotClass {
  _id: mongoose.Types.ObjectId;
  userGroupID: mongoose.Types.ObjectId;
  userID: mongoose.Types.ObjectId;
  potID: mongoose.Types.ObjectId;
  accepter: boolean;
}
const userGroupPotSchema = new mongoose.Schema<UserGroupPotClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userGroupID: { type: mongoose.Schema.Types.ObjectId },
  userID: { type: mongoose.Schema.Types.ObjectId },
  potID: { type: mongoose.Schema.Types.ObjectId },
  accepter: { type: Boolean },
});

const UserGroupPot =
  mongoose.models.UserGroupPot ||
  mongoose.model("UserGroupPot", userGroupPotSchema);

export default UserGroupPot;
