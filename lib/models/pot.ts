import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IPot {
  _id: string;
  potName: string;
  icon: string;
  selected: boolean;
}
interface PotClass {
  _id: mongoose.Types.ObjectId;
  potName: string;
  icon: string;
  selected: boolean;
}
const potSchema = new mongoose.Schema<PotClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  potName: { type: String },
  icon: { type: String },
  selected: { type: Boolean },
});

const Pot = mongoose.models.Pot || mongoose.model("Pot", potSchema);

export default Pot;
