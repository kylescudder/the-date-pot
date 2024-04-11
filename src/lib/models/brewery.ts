import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IBrewery {
  _id: string
  breweryName: string
}
interface BreweryClass {
  _id: mongoose.Types.ObjectId
  breweryName: string
}
const brewerySchema = new mongoose.Schema<BreweryClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  breweryName: { type: String }
})

const Brewery =
  mongoose.models.Brewery || mongoose.model('Brewery', brewerySchema)

export default Brewery
