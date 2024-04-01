import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IFilm {
  _id: string
  addedByID: string
  addedDate: Date
  archive: boolean
  filmName: string
  releaseDate: Date
  runTime: number
  userGroupID: string
  watched: boolean
  directors: string[]
  genres: string[]
  platforms: string[]
}
interface FilmClass {
  _id: mongoose.Types.ObjectId
  addedByID: mongoose.Types.ObjectId
  addedDate: Date
  archive: boolean
  filmName: string
  releaseDate: Date
  runTime: number
  userGroupID: mongoose.Types.ObjectId
  watched: boolean
  directors: string[]
  genres: string[]
  platforms: string[]
}
const FilmSchema = new mongoose.Schema<FilmClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  addedByID: { type: mongoose.Schema.Types.ObjectId },
  addedDate: { type: Date },
  archive: { type: Boolean },
  filmName: { type: String },
  releaseDate: { type: Date },
  runTime: { type: Number },
  userGroupID: { type: mongoose.Schema.Types.ObjectId },
  watched: { type: Boolean },
  directors: [{ type: String }],
  genres: [{ type: String }],
  platforms: [{ type: String }]
})

const Film = mongoose.models.Film || mongoose.model('Film', FilmSchema)

export default Film
