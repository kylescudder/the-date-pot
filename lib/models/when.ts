import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IWhen {
  _id: string
  when: string
}
interface WhenClass {
  _id: mongoose.Types.ObjectId
  when: string
}
const whenSchema = new mongoose.Schema<WhenClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  when: { type: String }
})

const When = mongoose.models.When || mongoose.model('When', whenSchema)

export default When
