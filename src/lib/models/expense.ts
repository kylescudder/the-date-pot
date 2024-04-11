import mongoose from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IExpense {
  _id: string
  expense: string
}
interface ExpenseClass {
  _id: mongoose.Types.ObjectId
  expense: string
}
const expenseSchema = new mongoose.Schema<ExpenseClass>({
  _id: { type: mongoose.Schema.Types.ObjectId },
  expense: { type: String }
})

const Expense =
  mongoose.models.Expense || mongoose.model('Expense', expenseSchema)

export default Expense
