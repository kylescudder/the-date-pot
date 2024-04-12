import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IBeerType {
  _id: string
  beerType: string
}
interface BeerTypeClass {
  _id: mongoose.Types.ObjectId
  beerType: string
}
const beerTypeSchema = new mongoose.Schema<BeerTypeClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  beerType: { type: String }
})

const BeerType =
  mongoose.models.BeerType || mongoose.model('BeerType', beerTypeSchema)

export default BeerType
