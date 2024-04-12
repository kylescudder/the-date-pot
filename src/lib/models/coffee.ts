import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface ICoffee {
  _id: string
  archive: boolean
  coffeeName: string
  addedByID: string
  userGroupID: string
  avgExperience: number
  avgTaste: number
  avgRating: number
  address: string
}
interface CoffeeClass {
  _id: mongoose.Types.ObjectId
  archive: boolean
  coffeeName: string
  addedByID: mongoose.Types.ObjectId
  userGroupID: mongoose.Types.ObjectId
  avgExperience: number
  avgTaste: number
  avgRating: number
  address: string
}
const CoffeeSchema = new mongoose.Schema<CoffeeClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  archive: { type: Boolean },
  coffeeName: { type: String },
  addedByID: { type: mongoose.Schema.Types.ObjectId },
  userGroupID: { type: mongoose.Schema.Types.ObjectId },
  avgExperience: { type: Number },
  avgTaste: { type: Number },
  avgRating: { type: Number },
  address: { type: String }
})

const Coffee = mongoose.models.Coffee || mongoose.model('Coffee', CoffeeSchema)

export default Coffee
