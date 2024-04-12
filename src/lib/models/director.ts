import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IDirector {
  _id: string
  directorName: string
}
interface DirectorClass {
  _id: mongoose.Types.ObjectId
  directorName: string
}
const directorSchema = new mongoose.Schema<DirectorClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  directorName: { type: String }
})

const Director =
  mongoose.models.Director || mongoose.model('Director', directorSchema)

export default Director
