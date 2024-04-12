import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IBeer {
  _id: string
  archive: boolean
  beerName: string
  abv: number
  breweries: string[]
  beerTypes: string[]
  addedByID: string
  userGroupID: string
  avgWankyness: number
  avgTaste: number
  avgRating: number
}
interface BeerClass {
  _id: mongoose.Types.ObjectId
  archive: boolean
  beerName: string
  abv: number
  breweries: string[]
  beerTypes: string[]
  addedByID: mongoose.Types.ObjectId
  userGroupID: mongoose.Types.ObjectId
  avgWankyness: number
  avgTaste: number
  avgRating: number
}
const BeerSchema = new mongoose.Schema<BeerClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  archive: { type: Boolean },
  beerName: { type: String },
  abv: { type: Number },
  breweries: { type: [String] },
  beerTypes: { type: [String] },
  addedByID: { type: mongoose.Schema.Types.ObjectId },
  userGroupID: { type: mongoose.Schema.Types.ObjectId },
  avgWankyness: { type: Number },
  avgTaste: { type: Number },
  avgRating: { type: Number }
})

const Beer = mongoose.models.Beer || mongoose.model('Beer', BeerSchema)

export default Beer
