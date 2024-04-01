'use server'

import { connectToDB } from '../mongoose'
import mongoose from 'mongoose'
import Expense from '../models/expense'

export async function getExpenseList() {
  try {
    connectToDB()

    return await Expense.find({})
  } catch (error: any) {
    throw new Error(`Failed to find expenses: ${error.message}`)
  }
}
