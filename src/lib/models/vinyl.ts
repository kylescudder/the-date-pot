import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IVinyl {
  _id: string
  addedByID: string
  archive: boolean
  artistName: string
  name: string
  purchased: boolean
  userGroupID: string
}
interface VinylClass {
  _id: mongoose.Types.ObjectId
  addedByID: mongoose.Types.ObjectId
  archive: boolean
  artistName: string
  name: string
  purchased: boolean
  userGroupID: mongoose.Types.ObjectId
}
const VinylSchema = new mongoose.Schema<VinylClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  addedByID: { type: mongoose.Schema.Types.ObjectId },
  archive: { type: Boolean },
  artistName: { type: String },
  name: { type: String },
  purchased: { type: Boolean },
  userGroupID: { type: mongoose.Schema.Types.ObjectId }
})

const Vinyl = mongoose.models.Vinyl || mongoose.model('Vinyl', VinylSchema)

export default Vinyl
